locals {
  websitePath = abspath("${path.root}/../page")
  contentTypeByFileExtension = {
    html = "text/html"
    json = "application/json"
    js   = "text/javascript"
    css  = "text/css"
  }
  urls = <<EOT
const allGamesUrl = "https://${azurerm_storage_account.handball-storage-account.name}.blob.core.windows.net/${azurerm_storage_container.handball-storage-container.name}/allgames.json${data.azurerm_storage_account_blob_container_sas.function_results_sas.sas}"
const nextGamesUrl = "https://${azurerm_storage_account.handball-storage-account.name}.blob.core.windows.net/${azurerm_storage_container.handball-storage-container.name}/nextgames.json${data.azurerm_storage_account_blob_container_sas.function_results_sas.sas}"
EOT 
}

resource "azurerm_storage_container" "handball-storage-web-container" {
  name                  = "$web"
  storage_account_name  = azurerm_storage_account.handball-storage-account.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "website-all-blob" {
  for_each = fileset("${local.websitePath}/", "**/*")

  name                   = each.key
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  content_type           = lookup(local.contentTypeByFileExtension, regex("[a-z]+$", each.key), "Block")
  source                 = "${local.websitePath}/${each.key}"
  content_md5            = filemd5("${local.websitePath}/${each.key}")
}

resource "azurerm_storage_blob" "website-fetch-blob" {
  name                   = "urls.js"
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  content_type           = "application/javascript"
  # content_md5            = md5(local.urls)
  source_content = local.urls
}

data "azurerm_storage_account_blob_container_sas" "function_results_sas" {
  connection_string = azurerm_storage_account.handball-storage-account.primary_connection_string
  container_name    = azurerm_storage_container.handball-storage-container.name

  start  = local.current_date
  expiry = local.two_years_later_date

  permissions {
    read   = true
    add    = false
    create = false
    write  = false
    delete = false
    list   = true
  }
}

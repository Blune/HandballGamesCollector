locals {
  websitePath = abspath("${path.root}/../page")
}

resource "azurerm_storage_container" "handball-storage-web-container" {
  name                  = "$web"
  storage_account_name  = azurerm_storage_account.handball-storage-account.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "website-blob" {
  name                   = "index.html"
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  content_type           = "text/html"
  source                 = "${local.websitePath}/index.html"
  content_md5            = filemd5("${local.websitePath}/index.html")
}

resource "azurerm_storage_blob" "website-manifest-blob" {
  name                   = "manifest.json"
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  content_type           = "application/json"
  source                 = "${local.websitePath}/manifest.json"
  content_md5            = filemd5("${local.websitePath}/manifest.json")
}

resource "azurerm_storage_blob" "website-javascript-blob" {
  depends_on = [ local_file.output_urls ]
  for_each = fileset("${local.websitePath}/", "*.js")

  name                   = each.key
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  content_type           = "text/javascript"
  source                 = "${local.websitePath}/${each.key}"
  content_md5            = filemd5("${local.websitePath}/${each.key}")
}

resource "azurerm_storage_blob" "website-asset-blob" {
  for_each = fileset("${local.websitePath}", "images/*.png")

  name                   = each.key
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  source                 = "${local.websitePath}/${each.key}"
  content_md5            = filemd5("${local.websitePath}/${each.key}")
}

resource "azurerm_storage_blob" "website-styles-blob" {
  for_each = fileset("${local.websitePath}", "css/*.css")

  name                   = each.key
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-web-container.name
  type                   = "Block"
  content_type           = "text/css"
  source                 = "${local.websitePath}/${each.key}"
  content_md5            = filemd5("${local.websitePath}/${each.key}")
}

data "template_file" "urls_template" {
  template = file("${local.websitePath}/urls.templatejs")
  vars = {
    allGamesJson  = "https://${azurerm_storage_account.handball-storage-account.name}.blob.core.windows.net/${azurerm_storage_container.handball-storage-container.name}/allgames.json${data.azurerm_storage_account_blob_container_sas.function_results_sas.sas}"
    nextGamesJson = "https://${azurerm_storage_account.handball-storage-account.name}.blob.core.windows.net/${azurerm_storage_container.handball-storage-container.name}/nextgames.json${data.azurerm_storage_account_blob_container_sas.function_results_sas.sas}"
  }
}

resource "local_file" "output_urls" {
  filename = "${local.websitePath}/urls.js"
  content  = data.template_file.urls_template.rendered
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
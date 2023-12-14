resource "azurerm_storage_account" "handball-storage-account" {
  name                      = "${local.name}storageaccount"
  resource_group_name       = azurerm_resource_group.handball-resource-group.name
  location                  = azurerm_resource_group.handball-resource-group.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  shared_access_key_enabled = false
  min_tls_version           = "TLS1_2"

  sas_policy {
    expiration_period = "712.00:00:00"
  }

  static_website {
    index_document = "index.html"
  }

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
}

resource "azurerm_storage_container" "handball-storage-container" {
  name                  = "function"
  storage_account_name  = azurerm_storage_account.handball-storage-account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "handball-deployments-storage-container" {
  name                  = "deployments"
  storage_account_name  = azurerm_storage_account.handball-storage-account.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "storage_blob_function" {
  name                   = "function.zip"
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-deployments-storage-container.name
  type                   = "Block"
  source                 = data.archive_file.function_zip.output_path
}


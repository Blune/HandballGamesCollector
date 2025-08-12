resource "azurerm_storage_account" "handball-storage-account" {
  name                     = "${local.name}storageaccount"
  resource_group_name      = azurerm_resource_group.handball-resource-group.name
  location                 = azurerm_resource_group.handball-resource-group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  sas_policy {
    expiration_period = "712.00:00:00"
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

resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.handball-storage-account.id
  error_404_document = "not_found.html"
  index_document     = "index.html"
}

resource "azurerm_storage_container" "handball-storage-container" {
  name                  = "function"
  storage_account_id    = azurerm_storage_account.handball-storage-account.id
  container_access_type = "private"
}

resource "azurerm_storage_container" "handball-deployments-storage-container" {
  name                  = "deployments"
  storage_account_id    = azurerm_storage_account.handball-storage-account.id
  container_access_type = "private"
}

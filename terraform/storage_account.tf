resource "azurerm_storage_account" "handball-storage-account" {
  name                     = "${local.name}storageaccount"
  resource_group_name      = azurerm_resource_group.handball-resource-group.name
  location                 = azurerm_resource_group.handball-resource-group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "handball-storage-container" {
  name                  = "function"
  storage_account_name  = azurerm_storage_account.handball-storage-account.name
  container_access_type  = "private"
}

resource "azurerm_storage_blob" "storage_blob_function" {
  name                   = "function.zip"
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-storage-container.name
  type                   = "Block"
  source                 = data.archive_file.function_zip.output_path
}


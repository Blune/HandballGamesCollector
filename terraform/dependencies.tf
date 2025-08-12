data "azurerm_storage_account_blob_container_sas" "sas" {
  connection_string = azurerm_storage_account.handball-storage-account.primary_connection_string
  container_name    = azurerm_storage_container.handball-deployments-storage-container.name

  start  = local.current_date
  expiry = local.two_years_later_date

  permissions {
    read   = true
    add    = false
    create = false
    write  = false
    delete = false
    list   = false
  }
}

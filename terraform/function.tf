resource "azurerm_linux_function_app" "handball-linux-function-app" {
  depends_on = [azurerm_storage_account.handball-storage-account, azurerm_storage_container.handball-storage-container, azurerm_storage_blob.storage_blob_function, data.azurerm_storage_account_blob_container_sas.sas]

  name                = "${local.name}-linux-function-app"
  resource_group_name = azurerm_resource_group.handball-resource-group.name
  location            = azurerm_resource_group.handball-resource-group.location

  storage_account_name       = azurerm_storage_account.handball-storage-account.name
  storage_account_access_key = azurerm_storage_account.handball-storage-account.primary_access_key
  service_plan_id            = azurerm_service_plan.handball-app-service-plan.id

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME       = "node"
    WEBSITE_RUN_FROM_PACKAGE       = "https://${azurerm_storage_account.handball-storage-account.name}.blob.core.windows.net/${azurerm_storage_container.handball-deployments-storage-container.name}/${azurerm_storage_blob.storage_blob_function.name}${data.azurerm_storage_account_blob_container_sas.sas.sas}"
    APPINSIGHTS_INSTRUMENTATIONKEY = "${azurerm_application_insights.application_insights.instrumentation_key}"
    STORAGE_CONTAINER_NAME         = "${azurerm_storage_container.handball-storage-container.name}"
    QUERY_URL                      = "https://spo.handball4all.de/service/if_g_json.php?"
    TEAM_CITY                      = "Laichingen"
    TEAM_REGION_BAWUE              = "3"
    TEAM_ORG_BODENSEE_DONAU        = "12"
  }

  site_config {
    application_stack {
      node_version = local.node_version
    }
  }
}

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

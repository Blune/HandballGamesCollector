provider "azurerm" {
  features {}
}

locals {
  name         = "handball"
  location     = "Germany West Central"
  node_version = "16"
  currentDate  = timestamp() #"2023-01-01T00:00:00Z"
}

resource "azurerm_resource_group" "handball-resource-group" {
  name     = "${local.name}-resource-group"
  location = local.location
}

resource "azurerm_service_plan" "handball-app-service-plan" {
  name                = "${local.name}-app-service-plan"
  resource_group_name = azurerm_resource_group.handball-resource-group.name
  location            = azurerm_resource_group.handball-resource-group.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

output "testing" {
  value = local.currentDate
}

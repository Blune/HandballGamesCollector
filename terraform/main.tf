terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-states"
    storage_account_name = "tfhandballstatestorage"
    container_name       = "tfstate"
    key                  = "handball-games-collector.tfstate"
  }
}

provider "azurerm" {
  features {}
}

locals {
  name                 = "handball"
  location             = "Germany West Central"
  node_version         = "16"
  two_years            = "17520h"
  current_date         = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  two_years_later_date = timeadd(local.current_date, local.two_years)
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

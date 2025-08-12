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

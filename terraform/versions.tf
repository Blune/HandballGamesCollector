terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.39.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.7.1"
    }

    null = {
      source  = "hashicorp/null"
      version = "3.2.4"
    }
  }
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.74.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.4.0"
    }

    null = {
      source  = "hashicorp/null"
      version = "3.2.1"
    }
  }
}

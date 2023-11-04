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

    local = {
      source  = "hashicorp/local"
      version = "2.4.0"
    }
    
    template = {
      source  = "hashicorp/template"
      version = "2.2.0"
    }
  }
}

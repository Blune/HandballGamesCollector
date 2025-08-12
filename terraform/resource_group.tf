resource "azurerm_resource_group" "handball-resource-group" {
  name     = "${local.name}-resource-group"
  location = local.location
}
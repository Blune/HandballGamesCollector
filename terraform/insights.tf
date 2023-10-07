resource "azurerm_application_insights" "application_insights" {
  name                = "${local.name}-appInsights"
  location            = azurerm_resource_group.handball-resource-group.location
  resource_group_name = azurerm_resource_group.handball-resource-group.name
  application_type    = "web"
}
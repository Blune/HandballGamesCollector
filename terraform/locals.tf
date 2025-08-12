locals {
  name     = "handball"
  location = "Germany West Central"

  os           = "Linux"
  runtime      = "node"
  node_version = "16"

  two_years            = "17520h"
  current_date         = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  two_years_later_date = timeadd(local.current_date, local.two_years)
}

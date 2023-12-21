locals {
  functionPath = abspath("${path.root}/../azure_function")
}

resource "null_resource" "create_function_package" {
  provisioner "local-exec" {
    command = "cd ${local.functionPath}/ && npm install"
  }

  triggers = {
    index   = sha256(file("${local.functionPath}/src/functions/FetchHandballData.js"))
    # next    = sha256(file("${local.functionPath}/src/functions/GetNextGames.js"))
    package = sha256(file("${local.functionPath}/package.json"))
    lock    = sha256(file("${local.functionPath}/package-lock.json"))
    node    = sha256(join("", fileset(local.functionPath, "/**/*.js")))
  }
}

data "archive_file" "function_zip" {
  type        = "zip"
  output_path = "${path.module}/function.zip"
  source_dir  = "${local.functionPath}/"

  depends_on = [null_resource.create_function_package]
}

resource "azurerm_storage_blob" "storage_blob_function" {
  name                   = "function.zip"
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-deployments-storage-container.name
  type                   = "Block"
  source                 = data.archive_file.function_zip.output_path
  content_md5            = data.archive_file.function_zip.output_md5
}

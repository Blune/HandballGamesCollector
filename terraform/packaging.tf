locals {
  functionPath = abspath("${path.root}/../azure_function")
  zipfile      = "function.zip"
}

resource "null_resource" "create_function_package" {
  provisioner "local-exec" {
    command = "cd ${local.functionPath}/ && npm install"
  }

  triggers = {
    function = sha256(file("${local.functionPath}/src/functions/FetchHandballData.js"))
    package  = sha256(file("${local.functionPath}/package.json"))
    lock     = sha256(file("${local.functionPath}/package-lock.json"))
    node     = sha256(join("", fileset(local.functionPath, "/**/*.js")))
  }
}

data "archive_file" "function_zip" {
  depends_on = [null_resource.create_function_package]

  type        = "zip"
  output_path = "${path.module}/${local.zipfile}"
  source_dir  = "${local.functionPath}/"
}

resource "azurerm_storage_blob" "storage_blob_function" {
  depends_on = [data.archive_file.function_zip]

  name                   = local.zipfile
  storage_account_name   = azurerm_storage_account.handball-storage-account.name
  storage_container_name = azurerm_storage_container.handball-deployments-storage-container.name
  type                   = "Block"
  source                 = data.archive_file.function_zip.output_path
  content_md5            = data.archive_file.function_zip.output_md5
  metadata = {
    # Force re-deploy if hash changes
    package_hash = data.archive_file.function_zip.output_base64sha256
  }
}

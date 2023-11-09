locals {
  functionPath = abspath("${path.root}/../azure_function")
}

resource "null_resource" "create_function_package" {
  provisioner "local-exec" {
    command = "cd ${local.functionPath}/ && npm install"
  }

  triggers = {
    index   = sha256(file("${local.functionPath}/src/functions/FetchHandballData.js"))
    package = sha256(file("${local.functionPath}/package.json"))
    lock    = sha256(file("${local.functionPath}/package-lock.json"))
    node    = sha256(join("", fileset(local.functionPath, "/**/*.js")))
  }
}

data "archive_file" "function_zip" {
  type        = "zip"
  output_path = "${path.module}/function.zip"
  source_dir  = "${local.functionPath}/"

  depends_on = [null_resource.function_dependencies]
}
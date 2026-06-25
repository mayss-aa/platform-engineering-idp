module "resource_group" {
  source = "../../modules/resource-group"

  resource_group_name = "rg-devops-stage"
  location            = "francecentral"
}
module "network" {

  source = "../../modules/network"

  resource_group_name = "rg-devops-stage"

  location = "francecentral"

  vnet_name   = "vnet-devops-stage"
  subnet_name = "subnet-dev"

  nsg_name = "nsg-dev"

  address_space = ["10.0.0.0/16"]

  subnet_prefixes = ["10.0.1.0/24"]

}
module "storage" {

  source = "../../modules/storage"

  resource_group_name = "rg-devops-stage"

  location = "francecentral"

  storage_account_name = "stdevopsmayssa01"

}
module "keyvault" {

  source = "../../modules/keyvault"

  resource_group_name = "rg-devops-stage"

  location = "francecentral"

  keyvault_name = "kvmayssadevops01"

  tenant_id = "604f1a96-cbe8-43f8-abbf-f8eaf5d85730"

}
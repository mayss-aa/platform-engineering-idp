output "vnet_name" {
  value = azurerm_virtual_network.vnet.name
}

output "subnet_name" {
  value = azurerm_subnet.subnet.name
}

output "nsg_name" {
  value = azurerm_network_security_group.nsg.name
}
package com.idp.idp_platform.exception;

public class ServiceCatalogNotFoundException extends RuntimeException {

    public ServiceCatalogNotFoundException(Long id) {
        super("Service Catalog not found with id: " + id);
    }
}
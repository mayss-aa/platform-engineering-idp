package com.idp.idp_platform.exception;

public class DuplicateServiceCatalogException extends RuntimeException {

    public DuplicateServiceCatalogException(String name) {
        super("A service already exists with name: " + name);
    }
}
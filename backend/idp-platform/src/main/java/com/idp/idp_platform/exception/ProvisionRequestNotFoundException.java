package com.idp.idp_platform.exception;

public class ProvisionRequestNotFoundException
        extends RuntimeException {

    public ProvisionRequestNotFoundException(Long id) {

        super("Provision Request not found with id: " + id);
    }
}

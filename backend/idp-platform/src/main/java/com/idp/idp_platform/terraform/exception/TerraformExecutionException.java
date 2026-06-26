package com.idp.idp_platform.terraform.exception;

/**
 * Exception thrown when a Terraform command execution fails.
 */
public class TerraformExecutionException extends RuntimeException {

    public TerraformExecutionException(String message) {
        super(message);
    }

    public TerraformExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
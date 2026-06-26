package com.idp.idp_platform.terraform.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Terraform integration.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "terraform")
public class TerraformProperties {

    /**
     * Path to the Terraform executable.
     * Example:
     * terraform
     * C:/HashiCorp/Terraform/terraform.exe
     */
    private String binaryPath;

    /**
     * Working directory containing Terraform configuration.
     */
    private String workingDirectory;

    /**
     * Maximum execution time (seconds).
     */
    private long timeout;

    /**
     * Enables or disables Terraform integration.
     */
    private boolean enabled;
}

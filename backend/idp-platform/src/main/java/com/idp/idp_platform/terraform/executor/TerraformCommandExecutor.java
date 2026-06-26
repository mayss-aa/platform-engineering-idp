package com.idp.idp_platform.terraform.executor;

import com.idp.idp_platform.terraform.model.TerraformResult;

public interface TerraformCommandExecutor {

    /**
     * Executes a Terraform command.
     *
     * Example:
     * execute("terraform", "init");
     * execute("terraform", "validate");
     * execute("terraform", "plan");
     */
    TerraformResult execute(String... command);

}
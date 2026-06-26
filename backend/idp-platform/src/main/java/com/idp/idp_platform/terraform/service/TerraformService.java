package com.idp.idp_platform.terraform.service;

import com.idp.idp_platform.terraform.model.TerraformResult;

public interface TerraformService {

    TerraformResult initialize();

    TerraformResult formatCheck();

    TerraformResult validate();

    TerraformResult plan();

    TerraformResult planInfrastructure();

}
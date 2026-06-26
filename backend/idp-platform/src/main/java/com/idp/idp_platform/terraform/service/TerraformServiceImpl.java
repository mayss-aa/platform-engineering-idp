package com.idp.idp_platform.terraform.service;

import com.idp.idp_platform.terraform.executor.TerraformCommandExecutor;
import com.idp.idp_platform.terraform.model.TerraformResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerraformServiceImpl implements TerraformService {

    private static final String TERRAFORM = "terraform";

    private final TerraformCommandExecutor executor;

    @Override
    public TerraformResult initialize() {

        log.info("Initializing Terraform workspace...");

        return executor.execute(
                TERRAFORM,
                "init"
        );
    }

    @Override
    public TerraformResult formatCheck() {

        log.info("Checking Terraform formatting...");

        return executor.execute(
                TERRAFORM,
                "fmt",
                "-check"
        );
    }

    @Override
    public TerraformResult validate() {

        log.info("Validating Terraform configuration...");

        return executor.execute(
                TERRAFORM,
                "validate"
        );
    }

    @Override
    public TerraformResult plan() {

        log.info("Generating Terraform execution plan...");

        return executor.execute(
                TERRAFORM,
                "plan",
                "-input=false"
        );
    }

    @Override
    public TerraformResult planInfrastructure() {

        return executePipeline(
                this::initialize,
                this::formatCheck,
                this::validate,
                this::plan
        );
    }

    @SafeVarargs
    private final TerraformResult executePipeline(
            Supplier<TerraformResult>... steps) {

        TerraformResult result = null;

        for (Supplier<TerraformResult> step : steps) {

            result = step.get();

            if (!result.isSuccess()) {
                return result;
            }
        }

        return result;
    }
}
package com.idp.idp_platform.terraform.executor;

import com.idp.idp_platform.terraform.config.TerraformProperties;
import com.idp.idp_platform.terraform.exception.TerraformExecutionException;
import com.idp.idp_platform.terraform.model.TerraformResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class TerraformCommandExecutorImpl implements TerraformCommandExecutor {

    private final TerraformProperties terraformProperties;

    @Override
    public TerraformResult execute(String... command) {

        long startTime = System.currentTimeMillis();

        try {

            log.info("Executing Terraform command: {}", Arrays.toString(command));

            ProcessBuilder processBuilder = new ProcessBuilder(command);

            processBuilder.directory(
                    new File(terraformProperties.getWorkingDirectory())
            );

            processBuilder.redirectErrorStream(false);

            Process process = processBuilder.start();

            String standardOutput = readStream(process.getInputStream());
            String errorOutput = readStream(process.getErrorStream());

            boolean finished = process.waitFor(
                    terraformProperties.getTimeout(),
                    TimeUnit.SECONDS
            );

            if (!finished) {

                process.destroyForcibly();

                throw new TerraformExecutionException(
                        "Terraform process timeout."
                );
            }

            int exitCode = process.exitValue();

            long executionTime =
                    System.currentTimeMillis() - startTime;

            return TerraformResult.builder()
                    .success(exitCode == 0)
                    .exitCode(exitCode)
                    .command(String.join(" ", command))
                    .standardOutput(standardOutput)
                    .errorOutput(errorOutput)
                    .executionTime(executionTime)
                    .build();

        } catch (Exception exception) {

            throw new TerraformExecutionException(
                    "Unable to execute Terraform command.",
                    exception
            );
        }
    }

    private String readStream(java.io.InputStream inputStream) {

        StringBuilder output = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        inputStream,
                        StandardCharsets.UTF_8))) {

            String line;

            while ((line = reader.readLine()) != null) {

                output.append(line)
                        .append(System.lineSeparator());

            }

        } catch (Exception exception) {

            log.error("Unable to read process stream.", exception);

        }

        return output.toString();
    }
}
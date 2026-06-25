package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Deployment;
import com.idp.idp_platform.entity.ProvisionRequest;
import com.idp.idp_platform.entity.enums.DeploymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeploymentRepository
        extends JpaRepository<Deployment, Long> {

    Optional<Deployment> findByProvisionRequest(
            ProvisionRequest provisionRequest);

    List<Deployment> findByStatus(
            DeploymentStatus status);

    boolean existsByProvisionRequest(
            ProvisionRequest provisionRequest);
}
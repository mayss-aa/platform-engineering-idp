package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
}
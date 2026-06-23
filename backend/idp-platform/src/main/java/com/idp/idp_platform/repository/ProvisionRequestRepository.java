package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.ProvisionRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProvisionRequestRepository extends JpaRepository<ProvisionRequest, Long> {
}
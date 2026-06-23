package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
}
package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.ServiceCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {
}
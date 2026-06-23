package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
}
package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {
}
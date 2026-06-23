package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
}
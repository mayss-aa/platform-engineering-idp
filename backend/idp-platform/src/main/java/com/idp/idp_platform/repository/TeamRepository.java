package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
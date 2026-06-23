package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
}
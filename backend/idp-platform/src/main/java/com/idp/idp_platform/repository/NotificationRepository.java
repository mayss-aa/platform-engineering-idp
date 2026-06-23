package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
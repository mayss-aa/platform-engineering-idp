package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.NotificationDto;

import java.util.List;

public interface NotificationService {


    NotificationDto createNotification(NotificationDto dto);

    List<NotificationDto> getAllNotifications();

    NotificationDto getNotificationById(Long id);

    void deleteNotification(Long id);


}

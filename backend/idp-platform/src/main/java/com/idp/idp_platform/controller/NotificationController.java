package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.NotificationDto;
import com.idp.idp_platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {


    private final NotificationService notificationService;

    @PostMapping
    public NotificationDto createNotification(
            @RequestBody NotificationDto dto) {

        return notificationService.createNotification(dto);
    }

    @GetMapping
    public List<NotificationDto> getAllNotifications() {

        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public NotificationDto getNotificationById(
            @PathVariable Long id) {

        return notificationService.getNotificationById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);
    }


}

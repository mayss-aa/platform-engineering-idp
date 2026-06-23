package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.NotificationDto;
import com.idp.idp_platform.entity.Notification;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.mapper.NotificationMapper;
import com.idp.idp_platform.repository.NotificationRepository;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {


    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper mapper;

    @Override
    public NotificationDto createNotification(NotificationDto dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .title(dto.getTitle())
                .message(dto.getMessage())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        return mapper.toDto(
                notificationRepository.save(notification)
        );
    }

    @Override
    public List<NotificationDto> getAllNotifications() {

        return notificationRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public NotificationDto getNotificationById(Long id) {

        return notificationRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));
    }

    @Override
    public void deleteNotification(Long id) {

        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found");
        }

        notificationRepository.deleteById(id);


}}

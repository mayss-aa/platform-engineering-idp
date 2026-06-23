package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.NotificationDto;
import com.idp.idp_platform.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {


    public NotificationDto toDto(Notification notification) {

        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .userId(
                        notification.getUser() != null
                                ? notification.getUser().getId()
                                : null
                )
                .build();
    }


}

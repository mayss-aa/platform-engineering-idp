package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {


    private Long id;

    private String title;

    private String message;

    private Boolean isRead;

    private Long userId;


}

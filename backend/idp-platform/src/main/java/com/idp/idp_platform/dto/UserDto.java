package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String status;

    private Long teamId;

    private Long roleId;
}
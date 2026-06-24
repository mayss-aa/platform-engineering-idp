package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.UserDto;
import com.idp.idp_platform.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {

        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .status(user.getStatus())
                .teamId(
                        user.getTeam() != null
                                ? user.getTeam().getId()
                                : null
                )
                .roleId(
                        user.getRole() != null
                                ? user.getRole().getId()
                                : null
                )
                .build();
    }
}
package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.UserDto;

import java.util.List;

public interface UserService {

    UserDto createUser(UserDto dto);

    List<UserDto> getAllUsers();

    UserDto getUserById(Long id);
}
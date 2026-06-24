package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.UserDto;
import com.idp.idp_platform.entity.Role;
import com.idp.idp_platform.entity.Team;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.mapper.UserMapper;
import com.idp.idp_platform.repository.RoleRepository;
import com.idp.idp_platform.repository.TeamRepository;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    public UserDto createUser(UserDto dto) {

        Team team = teamRepository.findById(dto.getTeamId())
                .orElseThrow(() ->
                        new RuntimeException("Team not found"));

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .status(dto.getStatus())
                .password("changeme")
                .createdAt(LocalDateTime.now())
                .team(team)
                .role(role)
                .build();

        return userMapper.toDto(
                userRepository.save(user)
        );
    }

    @Override
    public List<UserDto> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .toList();
    }

    @Override
    public UserDto getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return userMapper.toDto(user);
    }

    @Override
    public UserDto updateUser(Long id, UserDto dto) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Team team = teamRepository.findById(dto.getTeamId())
                .orElseThrow(() ->
                        new RuntimeException("Team not found"));

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setStatus(dto.getStatus());
        user.setTeam(team);
        user.setRole(role);

        return userMapper.toDto(
                userRepository.save(user)
        );
    }

    @Override
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        userRepository.deleteById(id);
    }
}
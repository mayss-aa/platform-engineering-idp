package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.RoleDto;
import com.idp.idp_platform.entity.Role;
import com.idp.idp_platform.mapper.RoleMapper;
import com.idp.idp_platform.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public RoleDto createRole(RoleDto dto) {

        Role role = roleMapper.toEntity(dto);

        return roleMapper.toDto(
                roleRepository.save(role)
        );
    }

    @Override
    public List<RoleDto> getAllRoles() {

        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toDto)
                .toList();
    }

    @Override
    public RoleDto getRoleById(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        return roleMapper.toDto(role);
    }
    @Override
    public void deleteRole(Long id) {

        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found");
        }

        roleRepository.deleteById(id);
    }
}
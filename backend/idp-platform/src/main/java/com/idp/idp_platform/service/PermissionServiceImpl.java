package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.PermissionDto;
import com.idp.idp_platform.entity.Permission;
import com.idp.idp_platform.mapper.PermissionMapper;
import com.idp.idp_platform.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    public PermissionDto createPermission(PermissionDto dto) {

        Permission permission = permissionMapper.toEntity(dto);

        return permissionMapper.toDto(
                permissionRepository.save(permission)
        );
    }

    @Override
    public List<PermissionDto> getAllPermissions() {

        return permissionRepository.findAll()
                .stream()
                .map(permissionMapper::toDto)
                .toList();
    }

    @Override
    public PermissionDto getPermissionById(Long id) {

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Permission not found"));

        return permissionMapper.toDto(permission);
    }

    @Override
    public PermissionDto updatePermission(Long id, PermissionDto dto) {

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Permission not found"));

        permission.setResource(dto.getResource());
        permission.setAction(dto.getAction());

        return permissionMapper.toDto(
                permissionRepository.save(permission)
        );
    }

    @Override
    public void deletePermission(Long id) {

        if (!permissionRepository.existsById(id)) {
            throw new RuntimeException("Permission not found");
        }

        permissionRepository.deleteById(id);
    }
}
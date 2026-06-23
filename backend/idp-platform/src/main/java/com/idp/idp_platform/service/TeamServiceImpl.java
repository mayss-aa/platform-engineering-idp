package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.TeamDto;
import com.idp.idp_platform.entity.Organization;
import com.idp.idp_platform.entity.Team;
import com.idp.idp_platform.mapper.TeamMapper;
import com.idp.idp_platform.repository.OrganizationRepository;
import com.idp.idp_platform.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public TeamDto createTeam(TeamDto dto) {

        Organization organization = organizationRepository
                .findById(dto.getOrganizationId())
                .orElseThrow(() ->
                        new RuntimeException("Organization not found"));

        Team team = Team.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .organization(organization)
                .build();

        return TeamMapper.toDto(
                teamRepository.save(team)
        );
    }

    @Override
    public List<TeamDto> getAllTeams() {

        return teamRepository.findAll()
                .stream()
                .map(TeamMapper::toDto)
                .toList();
    }

    @Override
    public TeamDto getTeamById(Long id) {

        return teamRepository.findById(id)
                .map(TeamMapper::toDto)
                .orElseThrow(() ->
                        new RuntimeException("Team not found"));
    }
}
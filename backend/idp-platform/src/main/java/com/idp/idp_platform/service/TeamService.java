package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.TeamDto;

import java.util.List;

public interface TeamService {

    TeamDto createTeam(TeamDto dto);

    List<TeamDto> getAllTeams();

    TeamDto getTeamById(Long id);
}
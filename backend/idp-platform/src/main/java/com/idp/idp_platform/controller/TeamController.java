package com.idp.idp_platform.controller;

import com.idp.idp_platform.dto.TeamDto;
import com.idp.idp_platform.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public TeamDto createTeam(
            @RequestBody TeamDto dto) {

        return teamService.createTeam(dto);
    }

    @GetMapping
    public List<TeamDto> getAllTeams() {

        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public TeamDto getTeamById(
            @PathVariable Long id) {

        return teamService.getTeamById(id);
    }
}
package com.idp.idp_platform.mapper;

import com.idp.idp_platform.dto.TeamDto;
import com.idp.idp_platform.entity.Team;

public class TeamMapper {

    public static TeamDto toDto(Team team) {

        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .organizationId(
                        team.getOrganization() != null
                                ? team.getOrganization().getId()
                                : null
                )
                .build();
    }
}
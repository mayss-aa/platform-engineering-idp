package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDto {

    private Long id;

    private String name;

    private String description;

    private Long organizationId;
}
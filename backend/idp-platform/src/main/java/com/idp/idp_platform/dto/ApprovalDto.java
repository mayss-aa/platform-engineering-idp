package com.idp.idp_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalDto {

    private Long id;

    private String decision;

    private String comment;

    private Long requestId;

    private Long approvedById;

}
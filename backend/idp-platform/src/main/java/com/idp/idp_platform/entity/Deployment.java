package com.idp.idp_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import com.idp.idp_platform.entity.enums.DeploymentStatus;
import java.time.LocalDateTime;

@Entity
@Table(name = "deployments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    private DeploymentStatus status;

    @Column(columnDefinition = "TEXT")
    private String terraformPlan;

    @Column(columnDefinition = "TEXT")
    private String terraformState;

    private LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(name = "request_id")
    private ProvisionRequest request;
}
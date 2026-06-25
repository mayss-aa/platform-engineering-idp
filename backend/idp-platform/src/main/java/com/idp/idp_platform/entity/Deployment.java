package com.idp.idp_platform.entity;

import com.idp.idp_platform.entity.enums.DeploymentStatus;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 30)
    private String environment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeploymentStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String deploymentLog;

    /*
     * Sprint 6 (Terraform Integration)
     * Ces champs seront utilisés lorsque nous intégrerons Terraform.
     */
    @Column(columnDefinition = "TEXT")
    private String terraformPlan;

    @Column(columnDefinition = "TEXT")
    private String terraformState;

    @OneToOne
    @JoinColumn(name = "provision_request_id", nullable = false, unique = true)
    private ProvisionRequest provisionRequest;

    @PrePersist
    public void prePersist() {

        this.startedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = DeploymentStatus.PENDING;
        }
    }
}
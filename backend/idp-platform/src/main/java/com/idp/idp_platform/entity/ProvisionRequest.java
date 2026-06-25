package com.idp.idp_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "provision_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvisionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "service_catalog_id")
    private ServiceCatalog serviceCatalog;

    @ManyToOne(optional = false)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(nullable = false, length = 50)
    private String environment;

    @Column(nullable = false, length = 1000)
    private String justification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProvisionStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "provisionRequest", fetch = FetchType.LAZY)
    private Deployment deployment;

    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = ProvisionStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {

        this.updatedAt = LocalDateTime.now();
    }
}
package com.idp.idp_platform.entity;

import jakarta.persistence.*;
import lombok.*;
import com.idp.idp_platform.entity.enums.RequestStatus;
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

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @Column(columnDefinition = "TEXT")
    private String parameters;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "catalog_id")
    private ServiceCatalog serviceCatalog;
}
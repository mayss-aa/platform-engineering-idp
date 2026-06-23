package com.idp.idp_platform.entity;

import com.idp.idp_platform.entity.enums.ApprovalDecision;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ApprovalDecision decision;

    private String comment;

    private LocalDateTime approvedAt;

    @OneToOne
    @JoinColumn(name = "request_id")
    private ProvisionRequest request;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
}
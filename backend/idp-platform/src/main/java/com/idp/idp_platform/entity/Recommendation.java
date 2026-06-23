package com.idp.idp_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double confidenceScore;

    @ManyToOne
    @JoinColumn(name = "incident_id")
    private Incident incident;
}
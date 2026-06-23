package com.idp.idp_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String status;

    private LocalDateTime openedAt;

    @ManyToOne
    @JoinColumn(name = "alert_id")
    private Alert alert;

    @OneToMany(mappedBy = "incident")
    private List<Recommendation> recommendations;
}
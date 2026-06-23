package com.idp.idp_platform.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "service_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private String templatePath;

    private String version;
}
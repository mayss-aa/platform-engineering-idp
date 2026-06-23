package com.idp.idp_platform.repository;

import com.idp.idp_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    @Query("""
            SELECT DISTINCT u
            FROM User u
            LEFT JOIN FETCH u.role r
            LEFT JOIN FETCH r.permissions
            WHERE u.email = :email
            """)
    Optional<User> findByEmailWithAuthorities(
            @Param("email") String email);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
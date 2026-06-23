package com.idp.idp_platform.security;

import com.idp.idp_platform.entity.Permission;
import com.idp.idp_platform.entity.User;
import com.idp.idp_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository
                .findByEmailWithAuthorities(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + email
                        ));

        List<GrantedAuthority> authorities =
                new ArrayList<>();

        authorities.add(
                new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().getName()
                )
        );

        if (user.getRole().getPermissions() != null) {

            for (Permission permission :
                    user.getRole().getPermissions()) {

                authorities.add(
                        new SimpleGrantedAuthority(
                                permission.getAction()
                        )
                );
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
package com.idp.idp_platform.service;

import com.idp.idp_platform.dto.auth.LoginRequest;
import com.idp.idp_platform.dto.auth.LoginResponse;
import com.idp.idp_platform.dto.auth.RegisterRequest;

public interface AuthenticationService {


    void register(RegisterRequest request);

    LoginResponse login(LoginRequest request);


}

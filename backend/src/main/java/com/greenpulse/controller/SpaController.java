package com.greenpulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/register",
        "/dashboard",
        "/reports/**",
        "/rewards",
        "/enforcement/**",
        "/moderator/**",
        "/field-worker/**",
        "/admin/**",
        "/analytics",
        "/notifications"
    })
    public String forward() {
        return "forward:/index.html";
    }
}

package com.greenpulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    /**
     * Fallback mapping to forward all frontend SPA routes to index.html
     * so that React Router can handle routing on page refresh or direct navigation.
     */
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

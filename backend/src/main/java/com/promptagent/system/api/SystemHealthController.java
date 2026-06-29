package com.promptagent.system.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemHealthController {

    @GetMapping("/health")
    public SystemHealthResponse health() {
        return new SystemHealthResponse("UP", "prompt-agent-api", "0.1.0");
    }
}

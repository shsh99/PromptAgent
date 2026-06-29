package com.promptagent.system.api;

public record SystemHealthResponse(String status, String service, String version) {
}

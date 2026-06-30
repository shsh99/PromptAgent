package com.promptagent.templatemarket.api;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(name = "ProblemDetailResponse", description = "RFC 7807 기반 API 오류",
    requiredProperties = {"type", "title", "status", "detail", "instance", "code", "message", "traceId",
        "fieldErrors"})
public record ProblemDetailResponse(
    String type,
    String title,
    int status,
    String detail,
    String instance,
    String code,
    String message,
    String traceId,
    List<FieldErrorResponse> fieldErrors
) {
    @Schema(requiredProperties = {"field", "message"})
    public record FieldErrorResponse(String field, String message) { }
}

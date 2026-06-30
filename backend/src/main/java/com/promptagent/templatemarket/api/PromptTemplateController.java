package com.promptagent.templatemarket.api;

import com.promptagent.templatemarket.application.PromptTemplateService;
import com.promptagent.templatemarket.application.TemplateQuery;
import com.promptagent.templatemarket.domain.Difficulty;
import com.promptagent.templatemarket.domain.PromptCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/prompt-templates")
public class PromptTemplateController {
    private final PromptTemplateService service;

    public PromptTemplateController(PromptTemplateService service) {
        this.service = service;
    }

    @Operation(summary = "공개 프롬프트 템플릿 목록 조회")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "목록 조회 성공",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = PromptTemplatePageResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 필터 또는 페이지",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ProblemDetailResponse.class)))
    })
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public PromptTemplatePageResponse findAll(
        @RequestParam(required = false) PromptCategory category,
        @Parameter(schema = @Schema(maxLength = 100)) @RequestParam(required = false) String query,
        @RequestParam(required = false) Difficulty difficulty,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        return PromptTemplatePageResponse.from(
            service.findAll(new TemplateQuery(category, query, difficulty, page, size)));
    }

    @Operation(summary = "공개 프롬프트 템플릿 상세 조회")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "상세 조회 성공",
            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = PromptTemplateDetailResponse.class))),
        @ApiResponse(responseCode = "404", description = "공개 템플릿 없음",
            content = @Content(mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                schema = @Schema(implementation = ProblemDetailResponse.class)))
    })
    @GetMapping(value = "/{templateId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public PromptTemplateDetailResponse findById(
        @Parameter(description = "URL-safe ASCII 템플릿 식별자") @PathVariable String templateId
    ) {
        return PromptTemplateDetailResponse.from(service.findById(templateId));
    }
}

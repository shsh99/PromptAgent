package com.promptagent.templatemarket.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PromptTemplateApiTest {
    @Autowired MockMvc mockMvc;

    @Test
    void 목록은_본문을_제외한_페이지_shape를_반환한다() throws Exception {
        mockMvc.perform(get("/api/v1/prompt-templates").param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.items", hasSize(2)))
            .andExpect(jsonPath("$.items[0].id").isString())
            .andExpect(jsonPath("$.items[0].categoryLabel").isString())
            .andExpect(jsonPath("$.items[0].verificationStatus").value("VERIFIED"))
            .andExpect(jsonPath("$.items[0].copyablePrompt").doesNotExist())
            .andExpect(jsonPath("$.items[0].requiredSections").doesNotExist())
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    void 상세는_필수_구성과_결정적_복사용_프롬프트를_반환한다() throws Exception {
        mockMvc.perform(get("/api/v1/prompt-templates/work-email-meeting-follow-up"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.requiredSections.input.targetAudience").isString())
            .andExpect(jsonPath("$.requiredSections.constraints.uncertaintyHandling").isString())
            .andExpect(jsonPath("$.requiredSections.qualityCriteria.selfCheck").isString())
            .andExpect(jsonPath("$.copyablePrompt", containsString("## 역할")));
    }

    @Test
    void 존재하지_않거나_비공개인_ID는_동일한_문제상세_404다() throws Exception {
        mockMvc.perform(get("/api/v1/prompt-templates/unknown"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.code").value("TEMPLATE_NOT_FOUND"))
            .andExpect(jsonPath("$.traceId").isString())
            .andExpect(jsonPath("$.fieldErrors", hasSize(0)));
        mockMvc.perform(get("/api/v1/prompt-templates/internal-draft"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title").value("프롬프트 템플릿을 찾을 수 없습니다."))
            .andExpect(jsonPath("$.detail").value("요청한 공개 프롬프트 템플릿이 존재하지 않습니다."))
            .andExpect(jsonPath("$.code").value("TEMPLATE_NOT_FOUND"));
    }

    @Test
    void 잘못된_enum과_페이지는_RFC7807_400이다() throws Exception {
        mockMvc.perform(get("/api/v1/prompt-templates").param("category", "INVALID"))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        mockMvc.perform(get("/api/v1/prompt-templates").param("page", "-1"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail", not(containsString("-1"))));
        mockMvc.perform(get("/api/v1/prompt-templates").param("query", "가".repeat(101)))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void 검색어_길이는_앞뒤_공백을_제거한_값으로_검증한다() throws Exception {
        mockMvc.perform(get("/api/v1/prompt-templates").param("query", "   " + "가".repeat(100) + "   "))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void OpenAPI는_경로_파라미터_enum과_문제상세를_기술한다() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates'].get.parameters").isArray())
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates/{templateId}'].get.responses['404']").exists())
            .andExpect(jsonPath("$.components.schemas.ProblemDetailResponse").exists())
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates'].get.parameters[?(@.name == 'query')].schema.maxLength")
                .value(100))
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates'].get.responses['200'].content['application/json']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates'].get.responses['400'].content['application/problem+json']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates/{templateId}'].get.responses['200'].content['application/json']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/prompt-templates/{templateId}'].get.responses['404'].content['application/problem+json']").exists())
            .andExpect(jsonPath("$.components.schemas.PromptTemplatePageResponse.required",
                hasItems("items", "page", "size", "totalElements", "totalPages")))
            .andExpect(jsonPath("$.components.schemas.PromptTemplateDetailResponse.required",
                hasItems("id", "version", "title", "requiredSections", "copyablePrompt")))
            .andExpect(jsonPath("$.components.schemas.RequiredSectionsResponse.required",
                hasItems("role", "objective", "input", "constraints", "outputFormat", "qualityCriteria")))
            .andExpect(jsonPath("$.components.schemas.ProblemDetailResponse.required",
                hasItems("type", "title", "status", "detail", "code", "traceId", "fieldErrors")))
            .andExpect(content().string(containsString("WORK_EMAIL")));
    }
}

package com.promptagent.system.infrastructure;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI promptAgentOpenApi() {
        return new OpenAPI().info(new Info()
            .title("PromptAgent API")
            .version("v1")
            .description("프롬프트 마켓, 상세 생성기, 에이전트 추천기 API"));
    }
}

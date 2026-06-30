package com.promptagent.templatemarket.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.promptagent.templatemarket.domain.PromptCategory;
import com.promptagent.templatemarket.domain.PromptTemplate;
import java.util.EnumSet;
import org.junit.jupiter.api.Test;

class InMemoryPromptTemplateRepositoryTest {

    @Test
    void 초기_여섯_카테고리에_공개_템플릿을_각각_제공하고_비공개_fixture도_포함한다() {
        var repository = new InMemoryPromptTemplateRepository();

        var publishedCategories = repository.findAll().stream().filter(PromptTemplate::isPublic)
            .map(PromptTemplate::category).collect(java.util.stream.Collectors.toSet());

        assertThat(publishedCategories).isEqualTo(EnumSet.of(PromptCategory.WORK_EMAIL,
            PromptCategory.YOUTUBE_EDITING, PromptCategory.WEBSITE_DEVELOPMENT,
            PromptCategory.CODE_DEBUGGING, PromptCategory.REPORT_WRITING, PromptCategory.IMAGE_GENERATION));
        assertThat(repository.findAll()).anyMatch(template -> !template.isPublic());
    }

    @Test
    void 초기_공개_템플릿은_카테고리별_고유_목적을_제공한다() {
        var repository = new InMemoryPromptTemplateRepository();

        assertThat(repository.findAll().stream().filter(PromptTemplate::isPublic)
            .map(template -> template.requiredSections().objective()).distinct()).hasSize(6);
    }
}

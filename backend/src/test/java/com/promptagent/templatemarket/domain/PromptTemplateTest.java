package com.promptagent.templatemarket.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class PromptTemplateTest {

    @Test
    void 식별자와_버전은_필수이며_서로_다른_개념이다() {
        assertThatThrownBy(() -> fixture("", "1", LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED))
            .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> fixture("same", "same", LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED))
            .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> fixture("한글 ID", "1", LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void 게시와_검증을_모두_만족해야_공개된다() {
        assertThat(fixture("a", "1", LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED).isPublic()).isTrue();
        assertThat(fixture("a", "1", LifecycleStatus.REVIEWED, VerificationStatus.VERIFIED).isPublic()).isFalse();
        assertThat(fixture("a", "1", LifecycleStatus.PUBLISHED, VerificationStatus.PENDING).isPublic()).isFalse();
    }

    @Test
    void 태그는_빈값과_대소문자_중복을_제거하고_순서를_보존한다() {
        PromptTemplate template = new PromptTemplate("a", "1", "제목", "요약", PromptCategory.WORK_EMAIL,
            Difficulty.BEGINNER, List.of("GENERAL_LLM"), List.of(" Mail ", "", "mail", "회의"),
            LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED, sections());

        assertThat(template.tags()).containsExactly("Mail", "회의");
    }

    static PromptTemplate fixture(String id, String version, LifecycleStatus lifecycle, VerificationStatus verification) {
        return new PromptTemplate(id, version, "제목", "요약", PromptCategory.WORK_EMAIL,
            Difficulty.BEGINNER, List.of("GENERAL_LLM"), List.of("메일"), lifecycle, verification, sections());
    }

    static PromptSections sections() {
        return new PromptSections("역할", "목적", new PromptSections.Input("배경", "대상"),
            new PromptSections.Constraints("규칙", "불확실성"), "출력",
            new PromptSections.QualityCriteria("품질", "점검"));
    }
}

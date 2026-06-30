package com.promptagent.templatemarket.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.promptagent.templatemarket.domain.Difficulty;
import com.promptagent.templatemarket.domain.LifecycleStatus;
import com.promptagent.templatemarket.domain.PromptCategory;
import com.promptagent.templatemarket.domain.PromptSections;
import com.promptagent.templatemarket.domain.PromptTemplate;
import com.promptagent.templatemarket.domain.VerificationStatus;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class PromptTemplateServiceTest {

    @Test
    void 저장소가_반환해도_비공개_템플릿을_다시_제외한다() {
        var service = service(List.of(
            fixture("public", "1", LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED),
            fixture("draft", "1", LifecycleStatus.DRAFT, VerificationStatus.VERIFIED),
            fixture("pending", "1", LifecycleStatus.PUBLISHED, VerificationStatus.PENDING)));

        assertThat(service.findAll(new TemplateQuery(null, null, null, 0, 20)).items())
            .extracting(PromptTemplate::id).containsExactly("public");
        assertThatThrownBy(() -> service.findById("draft")).isInstanceOf(TemplateNotFoundException.class);
    }

    @Test
    void 검색은_NFKC와_공백_대소문자를_정규화하고_모든_토큰을_AND로_적용한다() {
        var service = service(List.of(template("match", "ＡI 업무 메일", "회의 결과", List.of("Follow Up")),
            template("partial", "AI 업무 메일", "일반 안내", List.of("초안"))));

        var page = service.findAll(new TemplateQuery(null, "  ai   회의 FOLLOW  ", null, 0, 20));

        assertThat(page.items()).extracting(PromptTemplate::id).containsExactly("match");
    }

    @Test
    void 필수_구성과_복사용_프롬프트만의_단어는_검색하지_않는다() {
        PromptTemplate bodyOnly = new PromptTemplate("body-only", "1", "일반 제목", "일반 요약",
            PromptCategory.WORK_EMAIL, Difficulty.BEGINNER, List.of("GENERAL_LLM"), List.of("일반"),
            LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED,
            new PromptSections("역할", "본문전용단어", new PromptSections.Input("배경", "대상"),
                new PromptSections.Constraints("규칙", "불확실성"), "출력",
                new PromptSections.QualityCriteria("품질", "점검")));

        assertThat(service(List.of(bodyOnly))
            .findAll(new TemplateQuery(null, "본문전용단어", null, 0, 20)).items()).isEmpty();
    }

    @Test
    void 카테고리와_난이도를_AND로_필터링한다() {
        PromptTemplate matching = template("match", "제목", "요약", List.of("태그"));
        PromptTemplate wrongDifficulty = new PromptTemplate("advanced", "1", "제목", "요약",
            PromptCategory.WORK_EMAIL, Difficulty.ADVANCED, List.of("GENERAL_LLM"), List.of("태그"),
            LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED, PromptTemplateTestData.sections());
        var service = service(List.of(matching, wrongDifficulty));

        assertThat(service.findAll(new TemplateQuery(PromptCategory.WORK_EMAIL, null, Difficulty.BEGINNER, 0, 20)).items())
            .extracting(PromptTemplate::id).containsExactly("match");
    }

    @Test
    void 카테고리_제목_ID_순으로_정렬한_뒤_페이지를_나눈다() {
        PromptTemplate b = template("b", "나", "요약", List.of("태그"));
        PromptTemplate a = template("a", "가", "요약", List.of("태그"));
        PromptTemplate code = new PromptTemplate("code", "1", "가", "요약", PromptCategory.CODE_DEBUGGING,
            Difficulty.BEGINNER, List.of("GENERAL_LLM"), List.of("태그"), LifecycleStatus.PUBLISHED,
            VerificationStatus.VERIFIED, PromptTemplateTestData.sections());
        var service = service(List.of(code, b, a));

        TemplatePage first = service.findAll(new TemplateQuery(null, null, null, 0, 2));
        TemplatePage second = service.findAll(new TemplateQuery(null, null, null, 1, 2));

        assertThat(first.items()).extracting(PromptTemplate::id).containsExactly("a", "b");
        assertThat(first.totalElements()).isEqualTo(3);
        assertThat(first.totalPages()).isEqualTo(2);
        assertThat(second.items()).extracting(PromptTemplate::id).containsExactly("code");
    }

    @Test
    void 매우_큰_페이지도_오버플로_없이_빈_결과를_반환한다() {
        var service = service(List.of(template("a", "가", "요약", List.of("태그"))));

        assertThat(service.findAll(new TemplateQuery(null, null, null, Integer.MAX_VALUE, 100)).items())
            .isEmpty();
    }

    private PromptTemplateService service(List<PromptTemplate> values) {
        PromptTemplateRepository repository = new PromptTemplateRepository() {
            public List<PromptTemplate> findAll() { return values; }
            public Optional<PromptTemplate> findById(String id) {
                return values.stream().filter(value -> value.id().equals(id)).findFirst();
            }
        };
        return new PromptTemplateService(repository);
    }

    private PromptTemplate template(String id, String title, String summary, List<String> tags) {
        return new PromptTemplate(id, "1", title, summary, PromptCategory.WORK_EMAIL, Difficulty.BEGINNER,
            List.of("GENERAL_LLM"), tags, LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED,
            PromptTemplateTestData.sections());
    }

    private PromptTemplate fixture(
        String id,
        String version,
        LifecycleStatus lifecycle,
        VerificationStatus verification
    ) {
        return new PromptTemplate(id, version, "제목", "요약", PromptCategory.WORK_EMAIL,
            Difficulty.BEGINNER, List.of("GENERAL_LLM"), List.of("메일"), lifecycle, verification,
            PromptTemplateTestData.sections());
    }
}

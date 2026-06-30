package com.promptagent.templatemarket.infrastructure;

import com.promptagent.templatemarket.application.PromptTemplateRepository;
import com.promptagent.templatemarket.domain.Difficulty;
import com.promptagent.templatemarket.domain.LifecycleStatus;
import com.promptagent.templatemarket.domain.PromptCategory;
import com.promptagent.templatemarket.domain.PromptSections;
import com.promptagent.templatemarket.domain.PromptTemplate;
import com.promptagent.templatemarket.domain.VerificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryPromptTemplateRepository implements PromptTemplateRepository {
    private final List<PromptTemplate> templates = List.of(
        template("work-email-meeting-follow-up", "회의 후속 업무 메일", "합의 사항과 다음 행동을 명확히 전달합니다.",
            PromptCategory.WORK_EMAIL, Difficulty.BEGINNER, List.of("메일", "회의", "후속 업무")),
        template("youtube-editing-story-cut", "유튜브 스토리 편집안", "시청 흐름을 살리는 컷 편집안을 만듭니다.",
            PromptCategory.YOUTUBE_EDITING, Difficulty.INTERMEDIATE, List.of("유튜브", "영상", "편집")),
        template("website-development-plan", "웹사이트 개발 계획", "요구사항을 구현 가능한 개발 계획으로 바꿉니다.",
            PromptCategory.WEBSITE_DEVELOPMENT, Difficulty.INTERMEDIATE, List.of("웹사이트", "개발", "설계")),
        template("code-debugging-analysis", "코드 오류 분석과 수정", "재현부터 검증까지 안전한 수정 절차를 제안합니다.",
            PromptCategory.CODE_DEBUGGING, Difficulty.ADVANCED, List.of("코드", "오류", "테스트")),
        template("report-writing-executive", "의사결정 보고서 작성", "근거와 권고안을 갖춘 보고서를 작성합니다.",
            PromptCategory.REPORT_WRITING, Difficulty.INTERMEDIATE, List.of("보고서", "의사결정", "근거")),
        template("image-generation-brief", "이미지 생성 브리프", "일관된 결과를 위한 시각 브리프를 구성합니다.",
            PromptCategory.IMAGE_GENERATION, Difficulty.BEGINNER, List.of("이미지", "생성", "브리프")),
        hiddenTemplate()
    );

    @Override
    public List<PromptTemplate> findAll() {
        return templates;
    }

    @Override
    public Optional<PromptTemplate> findById(String id) {
        return templates.stream().filter(template -> template.id().equals(id)).findFirst();
    }

    private static PromptTemplate template(
        String id,
        String title,
        String summary,
        PromptCategory category,
        Difficulty difficulty,
        List<String> tags
    ) {
        return new PromptTemplate(id, "1", title, summary, category, difficulty, List.of("GENERAL_LLM"), tags,
            LifecycleStatus.PUBLISHED, VerificationStatus.VERIFIED, sections(category));
    }

    private static PromptTemplate hiddenTemplate() {
        return new PromptTemplate("internal-draft", "1", "내부 검토 초안", "공개하면 안 되는 테스트 자료",
            PromptCategory.WORK_EMAIL, Difficulty.BEGINNER, List.of("GENERAL_LLM"), List.of("내부"),
            LifecycleStatus.DRAFT, VerificationStatus.PENDING, sections(PromptCategory.WORK_EMAIL));
    }

    private static PromptSections sections(PromptCategory category) {
        return new PromptSections(
            "당신은 " + category.label() + " 업무를 정확하게 수행하는 전문가입니다.",
            objective(category),
            new PromptSections.Input("사용자의 업무 배경, 원본 자료와 요구사항을 입력으로 사용하세요.",
                "결과를 검토하고 실행할 실무 담당자입니다."),
            new PromptSections.Constraints("확인되지 않은 사실을 추가하지 말고 요구 범위를 지키세요.",
                "정보가 부족하면 추측하지 말고 확인이 필요한 항목을 명시하세요."),
            "핵심 결과, 근거, 다음 행동을 명확한 제목과 목록으로 작성하세요.",
            new PromptSections.QualityCriteria("정확성, 실행 가능성, 가독성을 모두 만족해야 합니다.",
                "누락, 모순, 근거 없는 추측과 요구 형식 위반이 없는지 최종 점검하세요."));
    }

    private static String objective(PromptCategory category) {
        return switch (category) {
            case WORK_EMAIL -> "회의 합의 사항과 담당자·기한을 전달하는 후속 메일을 작성하세요.";
            case YOUTUBE_EDITING -> "영상의 핵심 메시지와 시청 흐름을 살리는 컷 편집안을 작성하세요.";
            case WEBSITE_DEVELOPMENT -> "요구사항을 기능·화면·검증 단계가 있는 개발 계획으로 변환하세요.";
            case CODE_DEBUGGING -> "오류를 재현하고 원인을 입증한 뒤 최소 수정과 회귀 테스트를 제안하세요.";
            case REPORT_WRITING -> "근거, 선택지, 권고안과 다음 행동을 갖춘 의사결정 보고서를 작성하세요.";
            case IMAGE_GENERATION -> "주제, 구도, 조명, 색감과 금지 요소가 명확한 이미지 생성 지시를 작성하세요.";
            default -> "사용자가 제공한 자료를 바탕으로 실행 가능한 결과물을 작성하세요.";
        };
    }
}

package com.promptagent.templatemarket.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class PromptSectionsTest {

    @Test
    void 아홉_말단값은_모두_필수다() {
        List<String> values = List.of("역할", "목적", "배경", "대상", "규칙", "불확실성", "출력", "품질", "점검");

        for (int missing = 0; missing < values.size(); missing++) {
            var candidate = values.toArray(String[]::new);
            candidate[missing] = "  ";
            assertThatThrownBy(() -> sections(candidate)).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void 복사용_프롬프트는_항상_정해진_순서로_생성된다() {
        PromptSections sections = sections(new String[] {
            "역할", "목적", "배경", "대상", "규칙", "불확실성", "출력", "품질", "점검"
        });

        assertThat(sections.toCopyablePrompt()).isEqualTo("""
            ## 역할
            역할

            ## 목적
            목적

            ## 배경과 입력 데이터
            배경

            ## 대상 사용자
            대상

            ## 제약 조건
            규칙

            ## 정보 부족·불확실성 처리
            불확실성

            ## 출력 형식
            출력

            ## 품질 기준
            품질

            ## 최종 자체 점검
            점검""");
    }

    private PromptSections sections(String[] value) {
        return new PromptSections(value[0], value[1],
            new PromptSections.Input(value[2], value[3]),
            new PromptSections.Constraints(value[4], value[5]), value[6],
            new PromptSections.QualityCriteria(value[7], value[8]));
    }
}

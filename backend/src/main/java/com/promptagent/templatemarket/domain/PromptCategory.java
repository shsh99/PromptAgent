package com.promptagent.templatemarket.domain;

public enum PromptCategory {
    WORK_EMAIL("업무 메일"),
    YOUTUBE_EDITING("유튜브 편집"),
    WEBSITE_DEVELOPMENT("웹사이트 개발"),
    CODE_DEBUGGING("코드 오류 수정"),
    REPORT_WRITING("보고서 작성"),
    IMAGE_GENERATION("이미지 생성"),
    DATA_ANALYSIS("데이터 분석"),
    MEETING_PLANNING("회의·기획");

    private final String label;

    PromptCategory(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

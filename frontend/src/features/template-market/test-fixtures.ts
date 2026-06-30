export const summaryFixture = {
  id: 'work-email-meeting-follow-up', version: '1', title: '회의 후속 업무 메일',
  summary: '합의 사항과 다음 행동을 명확히 전달합니다.', category: 'WORK_EMAIL',
  categoryLabel: '업무 메일', difficulty: 'BEGINNER', targetModels: ['GENERAL_LLM'],
  tags: ['메일', '회의'], verificationStatus: 'VERIFIED',
} as const

export const detailFixture = {
  ...summaryFixture,
  requiredSections: {
    role: '업무 커뮤니케이션 전문가', objective: '후속 업무 메일 작성',
    input: { backgroundAndInput: '회의 정보', targetAudience: '회의 참석자' },
    constraints: { rules: '추측 금지', uncertaintyHandling: '확인 필요로 표시' },
    outputFormat: '제목과 본문',
    qualityCriteria: { criteria: '실행 가능성', selfCheck: '누락 점검' },
  },
  copyablePrompt: '## 역할\n업무 커뮤니케이션 전문가',
} as const

// 데이터 구조 변환 유틸리티 함수들

/**
 * API 응답 데이터를 Mock 데이터 구조로 변환
 * @param {Object} apiData - API에서 받은 데이터
 * @returns {Object} Mock 데이터 구조로 변환된 데이터
 */
export const transformApiToMock = (apiData) => {
  if (!apiData) return null;

  const {
    character,
    summary,
    concentration,
    weeklyProgress,
    activityBreakdown,
    contentTypeProgress,
  } = apiData;

  return {
    // 기본 정보
    studentId: character._id,
    studentName: character.nickname,
    groupId: null, // API에서 제공되지 않음
    characterId: character._id,

    // 학습 통계
    totalQuestionsAttempted: summary.totalQuestionsAttempted,
    totalCorrectAnswers: summary.totalCorrectAnswers,
    totalIncorrectAnswers: summary.totalIncorrectAnswers,
    totalConcentrationIssues: summary.totalConcentrationIssues,
    currentConsecutiveCorrect: summary.currentConsecutiveCorrect,
    maxConsecutiveCorrect: summary.maxConsecutiveCorrect,
    totalStudyTimeMinutes: summary.totalStudyTimeMinutes,
    averageAccuracy: summary.averageAccuracy,
    lastActivity: summary.lastActivity,

    // 상세 데이터
    weeklyProgress: weeklyProgress || [],
    activityBreakdown: activityBreakdown || [],
    contentTypeProgress: contentTypeProgress || [],

    // 집중도 데이터 (Mock에는 없지만 추가)
    concentration: concentration || {},

    // 빈 배열로 초기화 (Mock 데이터와 호환성을 위해)
    questionRecords: [],
    sessionRecords: [],
  };
};

/**
 * Mock 데이터를 API 응답 구조로 변환
 * @param {Object} mockData - Mock 데이터
 * @returns {Object} API 응답 구조로 변환된 데이터
 */
export const transformMockToApi = (mockData) => {
  if (!mockData) return null;

  return {
    character: {
      _id: mockData.characterId || mockData.studentId,
      nickname: mockData.studentName,
      icon: "🎓", // 기본값
      memo: "Mock 데이터",
    },
    summary: {
      totalQuestionsAttempted: mockData.totalQuestionsAttempted,
      totalCorrectAnswers: mockData.totalCorrectAnswers,
      totalIncorrectAnswers: mockData.totalIncorrectAnswers,
      averageAccuracy: mockData.averageAccuracy,
      totalStudyTimeMinutes: mockData.totalStudyTimeMinutes,
      totalConcentrationIssues: mockData.totalConcentrationIssues,
      currentConsecutiveCorrect: mockData.currentConsecutiveCorrect,
      maxConsecutiveCorrect: mockData.maxConsecutiveCorrect,
      lastActivity: mockData.lastActivity,
    },
    concentration: {
      avgFocusRate: 75, // 기본값
      avgAttentionScore: 0.75,
      faceLostCount: 0,
      lowLevelCount: 0,
      mediumLevelCount: 0,
      highLevelCount: 0,
    },
    weeklyProgress: mockData.weeklyProgress || [],
    activityBreakdown: mockData.activityBreakdown || [],
    contentTypeProgress: mockData.contentTypeProgress || [],
  };
};

/**
 * 통합된 데이터 구조로 변환 (API와 Mock 모두 지원)
 * @param {Object} data - API 또는 Mock 데이터
 * @param {string} source - 'api' 또는 'mock'
 * @returns {Object} 통합된 데이터 구조
 */
export const transformToUnified = (data, source = "api") => {
  if (!data) return null;

  if (source === "api") {
    return transformApiToMock(data);
  } else if (source === "mock") {
    return transformMockToApi(data);
  }

  return data;
};

/**
 * 학생 목록 데이터를 통합된 구조로 변환
 * @param {Array} students - 학생 목록 (API 또는 Mock)
 * @param {string} source - 'api' 또는 'mock'
 * @returns {Array} 통합된 학생 목록
 */
export const transformStudentList = (students, source = "api") => {
  if (!Array.isArray(students)) return [];

  return students.map((student) => {
    if (source === "api") {
      // API 응답의 경우 character 데이터를 student 형태로 변환
      return {
        _id: student._id,
        nickname: student.nickname,
        icon: student.icon,
        memo: student.memo,
        use: student.use,
        stats: student.stats || {},
        // Mock 데이터와 호환성을 위한 추가 필드
        studentId: student._id,
        studentName: student.nickname,
        characterId: student._id,
        totalQuestionsAttempted: student.stats?.totalQuestions || 0,
        totalCorrectAnswers: student.stats?.totalCorrect || 0,
        totalIncorrectAnswers:
          (student.stats?.totalQuestions || 0) -
          (student.stats?.totalCorrect || 0),
        averageAccuracy:
          student.stats?.totalQuestions > 0
            ? Math.round(
                (student.stats.totalCorrect / student.stats.totalQuestions) *
                  100 *
                  10
              ) / 10
            : 0,
        totalStudyTimeMinutes: student.stats?.totalStudyTimeMinutes || 0,
        totalConcentrationIssues: student.stats?.totalFocusLack || 0,
        currentConsecutiveCorrect: student.stats?.currentStreak || 0,
        maxConsecutiveCorrect: student.stats?.bestStreak || 0,
        lastActivity: student.stats?.lastActivity || new Date().toISOString(),
        weeklyProgress: [],
        activityBreakdown: [],
        contentTypeProgress: [],
        questionRecords: [],
        sessionRecords: [],
      };
    } else {
      // Mock 데이터는 그대로 반환
      return student;
    }
  });
};

/**
 * 학습 개요 데이터를 통합된 구조로 변환
 * @param {Object} overview - 학습 개요 데이터 (API 또는 Mock)
 * @param {string} source - 'api' 또는 'mock'
 * @returns {Object} 통합된 학습 개요 데이터
 */
export const transformOverview = (overview, source = "api") => {
  if (!overview) return null;

  if (source === "api") {
    return {
      totalActiveStudents: overview.totalActiveStudents || 0,
      totalQuestionsAttempted: overview.totalQuestionsAttempted || 0,
      averageAccuracy: overview.averageAccuracy || 0,
      totalStudyHours: overview.totalStudyHours || 0,
      dailyActivity: overview.dailyActivity || [],
      activityTypeDistribution: overview.activityTypeDistribution || [],
      contentTypeDistribution: overview.contentTypeDistribution || [],
      // Mock 데이터와 호환성을 위한 추가 필드
      difficultyDistribution: [], // API에서 제공되지 않음
    };
  } else {
    // Mock 데이터는 그대로 반환
    return overview;
  }
};

/**
 * 데이터 소스 자동 감지 및 변환
 * @param {Object} data - 변환할 데이터
 * @returns {Object} 변환된 데이터
 */
export const autoTransform = (data) => {
  if (!data) return null;

  // API 응답 구조인지 확인 (character, summary 필드 존재)
  if (data.character && data.summary) {
    return transformApiToMock(data);
  }

  // Mock 데이터 구조인지 확인 (studentName, totalQuestionsAttempted 필드 존재)
  if (data.studentName && data.totalQuestionsAttempted !== undefined) {
    return transformMockToApi(data);
  }

  // 알 수 없는 구조는 그대로 반환
  return data;
};

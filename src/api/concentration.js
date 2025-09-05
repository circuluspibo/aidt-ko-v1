import { API_URL } from ".";
// 세션 시작
export const startLearningSession = async (data) => {
  try {
    const { activityType, contentType, chapterId, characterId } = data;
    console.log("/sessions", data);
    const response = await fetch(`${API_URL()}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityType, // read/listen/speak/write
        contentType, // vowel/consonant/letter/word
        chapterId,
        characterId,
        deviceInfo: {
          userAgent: navigator?.userAgentData, // 브라우저, OS 등
          platform: navigator?.platform,
          screenResolution: `${screen?.width}x${screen?.height}`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result?.result) {
      console.log("✅ 세션 시작 데이터 전송 완료:", result?.data?._id);
      return result?.data;
    }
    throw new Error("세션 시작 데이터 전송 실패");
  } catch (error) {
    console.error("❌ 세션 시작 데이터 전송 실패:", error);
    throw error;
  }
};

export const addAttemptData = async (data) => {
  try {
    const response = await fetch(`${API_URL()}/attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result?.result) {
      console.log("✅ 문제 응답 데이터 전송 완료:", result?.data?._id);
      return result?.data;
    }
    throw new Error("문제 응답 데이터 전송 실패");
  } catch (error) {
    console.error("❌ 문제 응답 데이터 전송 실패:", error);
    throw error;
  }
};

// 문제별 학습 및 집중도 데이터 전송
export const recordQuestionData = async (questionData) => {
  try {
    console.log("/session/q", questionData);
    return true;
    /* const response = await fetch(`${API_URL()}/sessions/q`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: questionData.sessionId,
        characterId: questionData.characterId,
        questionNumber: questionData.questionNumber,

        // 학습 데이터
        solvingTime: questionData.solvingTime,
        isCorrect: questionData.isCorrect,
        submittedAnswer: questionData.submittedAnswer,
        correctAnswer: questionData.correctAnswer,
        questionText: questionData.questionText,
        questionType: questionData.questionType,

        repetition_count: questionData.repetitionCount,
        activity_type: questionData.activityType,

        // 집중도 데이터
        focus_status_at_start: questionData.focusStatusAtStart,
        focus_status_at_end: questionData.focusStatusAtEnd,
        face_detected: questionData.faceDetected,
        attention_score: questionData.attentionScore,
        eye_tracking_data: questionData.eyeTrackingData,
        head_pose_data: questionData.headPoseData,
        concentration_issue: questionData.concentrationIssue,
        issue_type: questionData.issueType,

        timestamp: questionData.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("📝 문제별 데이터 전송 완료:", questionData.questionNumber);
    return result; */
  } catch (error) {
    console.error("❌ 문제별 데이터 전송 실패:", error);
    throw error;
  }
};

// 중요한 집중도 이벤트 저장 (즉시 경고/알림 발생 시)
export const saveConcentrationEventData = async (eventData) => {
  try {
    console.log("/session/concentration-event", eventData);
    /* const response = await fetch(`${API_URL()}/sessions/concentration-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: eventData.sessionId,
        event_type: eventData.eventType, // focus_lost, focus_regained, face_not_detected 등
        event_timestamp: eventData.timestamp,
        duration: eventData.duration, // 이벤트 지속 시간 (초)
        trigger: eventData.trigger, // 이벤트 발생 원인
        attention_score: eventData.attentionScore,
        focus_status: eventData.focusStatus,
        face_detected: eventData.faceDetected,
        eye_position: eventData.eyePosition, // {x, y} 또는 null
        head_tilt: eventData.headTilt,
        additional_data: eventData.additionalData || {}, // 기타 관련 데이터
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("📝 집중도 이벤트 저장 완료:", eventData.eventType);
    return result; */
  } catch (error) {
    console.error("❌ 집중도 이벤트 저장 실패:", error);
    throw error;
  }
};

// 세션 종료 및 요약 데이터 전송
export const endLearningSession = async (sessionData) => {
  try {
    console.log("/session/end", sessionData);
    return true;
    /*
    const response = await fetch(`${API_URL()}/sessions/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionData.sessionId,
        student_id: sessionData.studentId,
        end_time: sessionData.endTime,

        // 학습 성과 요약
        total_questions_attempted: sessionData.totalQuestions,
        total_correct_answers: sessionData.correctAnswers,
        total_incorrect_answers: sessionData.incorrectAnswers,

        // 집중도 요약
        total_concentration_issues: sessionData.concentrationIssues,
        average_focus_rate: sessionData.averageFocusRate,
        average_attention_score: sessionData.averageAttentionScore,
        concentration_level: sessionData.concentrationLevel,
        session_quality_score: sessionData.sessionQuality,

        // 집중도 이슈 세부 분석
        focus_issues_breakdown: {
          fast_answers: sessionData.fastAnswers,
          slow_answers: sessionData.slowAnswers,
          consecutive_wrong: sessionData.consecutiveWrong,
          inactivity_periods: sessionData.inactivityPeriods,
          face_not_detected: sessionData.faceNotDetected,
        },

        // 활동 및 콘텐츠 정보
        activity_type: sessionData.activityType,
        content_type: sessionData.contentType,
        chapter_id: sessionData.chapterId,
        character_id: sessionData.characterId,

        // 세션 통계
        session_duration: sessionData.duration,
        average_solving_time: sessionData.averageSolvingTime,
        max_consecutive_correct: sessionData.maxConsecutiveCorrect,
        max_consecutive_wrong: sessionData.maxConsecutiveWrong,

        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("📊 세션 종료 데이터 전송 완료:", sessionData.sessionId);
    return result;*/
  } catch (error) {
    console.error("❌ 세션 종료 데이터 전송 실패:", error);
    throw error;
  }
};

// 세션 중간 저장 (장시간 세션 대비)
export const saveSessionProgress = async (progressData) => {
  try {
    console.log("/session/progress", progressData);
    return true;
    /*
    const response = await fetch(`${API_URL()}/sessions/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: progressData.sessionId,
        student_id: progressData.studentId,
        current_question: progressData.currentQuestion,
        questions_completed: progressData.questionsCompleted,
        current_concentration_level: progressData.concentrationLevel,
        session_duration_so_far: progressData.durationSoFar,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("💾 세션 진행상황 저장 완료");
    return result;*/
  } catch (error) {
    console.error("❌ 세션 진행상황 저장 실패:", error);
    throw error;
  }
};

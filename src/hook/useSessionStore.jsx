/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import { useParams } from "react-router-dom";

const STORAGE_KEY = "hangul_learning_session";

export const useSessionStore = () => {
  const { character } = useParams();

  const getSessionData = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === "1.0") return saved;

    return {
      character: character || null,
      version: "1.0",
      updatedAt: new Date().toISOString(),
      sessions: {},
      stats: {
        totalQuestions: 0,
        totalCorrects: 0,
        totalIncorrects: 0,
        totalFocusLack: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalTime: 0,
        attempts: [],
        sessionStart: Date.now(),
      },
    };
  };

  const saveToStorage = useCallback((data) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString(),
      })
    );
  }, []);

  const loadProgress = useCallback((chapterId, method) => {
    const data = getSessionData();
    console.log("Loading progress for:", { chapterId, method, data });

    // 저장된 데이터 구조에 맞춰서 로드
    // chapterId를 키로 사용하고, method를 하위 키로 사용
    const session = data.sessions?.[chapterId]?.[method] || null;

    if (session) {
      console.log("Found session:", session);
      return session;
    }

    console.log("No session found for:", { chapterId, method });
    return null;
  }, []);

  const saveProgress = useCallback(
    (chapterId, method, index, letter, question, learningCount, target) => {
      const data = getSessionData();

      // 저장된 데이터 구조에 맞춰서 저장
      // chapterId를 키로 사용하고, method를 하위 키로 사용
      if (!data.sessions[chapterId]) data.sessions[chapterId] = {};
      data.sessions[chapterId][method] = {
        chapterId,
        target, // 'consonant', 'vowel', 'letter', 'word' 중 하나
        method,
        index,
        question,
        learningCount,
        letter,
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving progress:", {
        chapterId,
        target,
        method,
        index,
        letter,
        question,
        learningCount,
        sessions: data.sessions,
      });

      saveToStorage(data);
    },
    [saveToStorage]
  );

  const loadStats = useCallback(() => {
    const data = getSessionData();
    return data.stats;
  }, []);

  const saveStats = useCallback(
    (stats) => {
      const data = getSessionData();
      data.stats = stats;
      saveToStorage(data);
    },
    [saveToStorage]
  );

  const hasSavedProgress = useCallback(() => {
    const data = getSessionData();
    const sessions = data.sessions || {};
    return Object.keys(sessions).length > 0;
  }, []);

  const getAllProgress = useCallback(() => {
    const data = getSessionData();
    const sessions = data.sessions || {};
    const result = [];

    Object.entries(sessions).forEach(([chapterId, methods]) => {
      Object.entries(methods).forEach(([method, session]) => {
        result.push({
          character: data.character,
          chapterId,
          target: session.target, // 'consonant', 'vowel', 'letter', 'word' 중 하나
          method,
          index: session.index,
          question: session.question,
          learningCount: session.learningCount,
          updatedAt: session.updatedAt,
          letter: session.letter,
        });
      });
    });

    const sorted = result.length
      ? result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : [];
    return sorted;
  }, []);

  const getDefaultProgress = useCallback(() => {
    const data = getAllProgress();
    if (data.length) return data[0];
    return null;
  }, []);

  const clearSessionFor = useCallback(
    (chapterId, method) => {
      const data = getSessionData();
      if (data.sessions?.[chapterId]?.[method]) {
        delete data.sessions[chapterId][method];

        // chapterId 객체가 비면 통째로 삭제
        if (Object.keys(data.sessions[chapterId]).length === 0) {
          delete data.sessions[chapterId];
        }
        saveToStorage(data);
      }
    },
    [saveToStorage]
  );

  // 특정 chapterId와 method에 대한 세션 데이터 검증
  const validateSessionData = useCallback((chapterId, method) => {
    const data = getSessionData();
    const session = data.sessions?.[chapterId]?.[method];

    if (!session) {
      console.log(
        `No session found for chapterId: ${chapterId}, method: ${method}`
      );
      return false;
    }

    const requiredFields = [
      "chapterId",
      "target",
      "method",
      "index",
      "question",
      "learningCount",
      "letter",
      "updatedAt",
    ];
    const missingFields = requiredFields.filter((field) => !session[field]);

    if (missingFields.length > 0) {
      console.log(`Missing fields in session: ${missingFields.join(", ")}`);
      return false;
    }

    console.log(
      `Valid session found for chapterId: ${chapterId}, method: ${method}`,
      session
    );
    return true;
  }, []);

  // 테스트를 위한 샘플 데이터 생성 함수
  const createTestData = useCallback(() => {
    const testData = {
      character: "68a2e0f5b124a9859d5a1af1",
      version: "1.0",
      updatedAt: new Date().toISOString(),
      sessions: {
        "68ac08a26ad954df62615ffc": {
          read: {
            chapterId: "68ac08a26ad954df62615ffc",
            target: "consonant", // 'consonant', 'vowel', 'letter', 'word' 중 하나
            method: "read",
            index: 2,
            question: 1,
            learningCount: 1,
            letter: "과자",
            updatedAt: "2025-08-25T14:07:56.548Z",
          },
        },
        "68ac1c9c5e4d000cbedb0dfd": {
          read: {
            chapterId: "68ac1c9c5e4d000cbedb0dfd",
            target: "vowel", // 'consonant', 'vowel', 'letter', 'word' 중 하나
            method: "read",
            index: 136,
            question: 1,
            learningCount: 1,
            letter: "짹짹",
            updatedAt: "2025-08-25T15:40:45.004Z",
          },
        },
      },
      stats: {
        totalQuestions: 0,
        totalCorrects: 0,
        totalIncorrects: 0,
        totalFocusLack: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalTime: 0,
        attempts: [],
        sessionStart: Date.now(),
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(testData));
    console.log("Test data created:", testData);
    return testData;
  }, []);

  return {
    loadProgress,
    saveProgress,
    loadStats,
    saveStats,
    hasSavedProgress,
    validateSessionData,
    getAllProgress,
    getDefaultProgress,
    clearSessionFor,
    createTestData,
  };
};

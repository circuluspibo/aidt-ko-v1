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

  const loadProgress = useCallback((target, method) => {
    const data = getSessionData();
    return data.sessions?.[target]?.[method] || null;
  }, []);

  const saveProgress = useCallback(
    (target, method, index, letter, question, learningCount) => {
      const data = getSessionData();
      if (!data.sessions[target]) data.sessions[target] = {};
      data.sessions[target][method] = {
        target,
        method,
        index,
        question,
        learningCount,
        letter,
        updatedAt: new Date().toISOString(),
      };
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

    Object.entries(sessions).forEach(([target, methods]) => {
      Object.entries(methods).forEach(([method, session]) => {
        result.push({
          character: data.character,
          target,
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

  const clearSessionFor = useCallback((target, method) => {
    const data = getSessionData();
    if (data.sessions?.[target]?.[method]) {
      delete data.sessions[target][method];

      // target 객체가 비면 통째로 삭제
      if (Object.keys(data.sessions[target]).length === 0) {
        delete data.sessions[target];
      }
      saveToStorage(data);
    }
  }, []);

  return {
    loadProgress,
    saveProgress,
    loadStats,
    saveStats,
    hasSavedProgress,
    getAllProgress,
    getDefaultProgress,
    clearSessionFor,
  };
};

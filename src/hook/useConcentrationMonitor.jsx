/* eslint-disable react-hooks/exhaustive-deps */
// 시간 기반 + 카메라 기반 집중도 감지
import { useState, useEffect, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

export const useConcentrationMonitor = (sessionId, studentId, videoRef) => {
  const [concentrationData, setConcentrationData] = useState({
    questionSolvingTimes: [],
    suspiciouslyFastAnswers: 0,
    suspiciouslySlowAnswers: 0,
    consecutiveWrongAnswers: 0,
    maxConsecutiveWrong: 0,
    inactivityPeriods: [],
    concentrationIssues: 1, // 초기값을 1로 설정 (medium 상태 시작)
    // 카메라 기반 집중도 데이터 추가
    focusData: {
      focusLog: [],
      focusRate: 0,
      faceDetected: false,
      eyeTrackingData: [],
      headPoseData: [],
      attentionScore: 0,
    },
  });

  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const questionStartTime = useRef(null);
  const inactivityTimer = useRef(null);

  // 카메라 관련 refs (videoRef는 외부에서 받음)
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const focusLogRef = useRef([]);
  const noFaceFrameCount = useRef(0);
  // 히스테리시스 & 디바운스용 ref
  const HYST_LOW = 60; // 낮음 트리거
  const HYST_HIGH = 75; // 해제 트리거
  const HOLD_EVALS = 3; // 같은 방향 3회 연속일 때만 변경 (checkFocusLevel 주기가 1초면 ≈3초)
  const MIN_ALERT_MS = 2000; // 알림 최소 유지시간

  const belowStreak = useRef(0);
  const aboveStreak = useRef(0);
  const alertStatus = useRef("normal"); // "normal" | "low"
  const lastAlertChangeAt = useRef(0);

  // 비활성 시간 감지
  const detectInactivity = () => {
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivityTime.current;

    if (inactiveTime > 120000) {
      // 2분 이상 비활성 (태블릿 환경 고려)
      setConcentrationData((prev) => ({
        ...prev,
        inactivityPeriods: [...prev.inactivityPeriods, inactiveTime],
        concentrationIssues: prev.concentrationIssues + 1,
      }));
    }
  };

  // 문제 시작 시 호출
  const startQuestionTimer = () => {
    questionStartTime.current = Date.now();
    lastActivityTime.current = Date.now();
  };

  // 문제 완료 시 호출 - 문제 풀이 시간 계산 및 집중도 통계 업데이트
  const endQuestionTimer = (isCorrect) => {
    if (!questionStartTime.current) return 0;

    const solvingTime = (Date.now() - questionStartTime.current) / 1000; // 초 단위 - 문제 시작부터 답안 제출까지의 시간

    setConcentrationData((prev) => {
      // 문제 풀이 시간 배열에 추가 (집중도 분석용)
      const newSolvingTimes = [...prev.questionSolvingTimes, solvingTime];

      // 집중도 이슈 감지: 비정상적으로 빠른/느린 응답 패턴 분석
      let newSuspiciouslyFast = prev.suspiciouslyFastAnswers;
      let newSuspiciouslySlow = prev.suspiciouslySlowAnswers;

      if (solvingTime < 2) {
        newSuspiciouslyFast += 1; // 2초 미만 응답 - 집중도 부족 의심
        console.log("⚡ 빠른 응답:", solvingTime.toFixed(1) + "초");
      } else if (solvingTime > 60) {
        newSuspiciouslySlow += 1; // 60초 초과 응답 - 집중도 부족 의심
        console.log("🐌 느린 응답:", solvingTime.toFixed(1) + "초");
      }

      // 연속 오답 패턴 분석 - 학습 집중도 저하 지표
      let newConsecutiveWrong = isCorrect
        ? 0
        : prev.consecutiveWrongAnswers + 1;
      let newMaxConsecutiveWrong = Math.max(
        prev.maxConsecutiveWrong,
        newConsecutiveWrong
      );

      if (!isCorrect && newConsecutiveWrong > 3) {
        console.log("❌ 연속 오답:", newConsecutiveWrong + "회");
      }

      return {
        ...prev,
        questionSolvingTimes: newSolvingTimes, // 문제별 풀이 시간 기록
        suspiciouslyFastAnswers: newSuspiciouslyFast, // 빠른 응답 횟수
        suspiciouslySlowAnswers: newSuspiciouslySlow, // 느린 응답 횟수
        consecutiveWrongAnswers: newConsecutiveWrong, // 연속 오답 횟수
        maxConsecutiveWrong: newMaxConsecutiveWrong, // 최대 연속 오답 기록
        inactivityPeriods: [], // 답변 제출 시 비활성 시간 기록 초기화
      };
    });

    lastActivityTime.current = Date.now();

    // ✅ 문제 풀이 시간 반환
    return solvingTime;
  };

  // 사용자 활동 감지
  const updateActivity = () => {
    lastActivityTime.current = Date.now();

    // 사용자 활동 시 집중도 이슈 즉시 감소 및 비활성 시간 초기화
    setConcentrationData((prev) => ({
      ...prev,
      concentrationIssues: Math.max(0, prev.concentrationIssues - 0.3),
      inactivityPeriods: [], // 사용자 활동 시 비활성 시간 기록 초기화
    }));
  };

  // FaceMesh 결과 처리
  const onFaceMeshResults = (results) => {
    if (results.multiFaceLandmarks?.length > 0) {
      const lm = results.multiFaceLandmarks[0]; // 랜드마크 478개

      // 1) iris 센터 (478 모델일 때 각 눈 5점: 좌 468~472, 우 473~477)
      const irisCenter = (idxs) => {
        let x = 0,
          y = 0;
        idxs.forEach((i) => {
          x += lm[i].x;
          y += lm[i].y;
        });
        return { x: x / idxs.length, y: y / idxs.length };
      };
      const leftIris = irisCenter([468, 469, 470, 471, 472]);
      const rightIris = irisCenter([473, 474, 475, 476, 477]);

      // 2) 눈 코너 (좌: 33,133 / 우: 362,263). 눈 중심과 눈 폭(정규화 기준) 계산
      const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

      const leftCornerA = lm[33],
        leftCornerB = lm[133];
      const rightCornerA = lm[362],
        rightCornerB = lm[263];

      const leftEyeCenter = mid(leftCornerA, leftCornerB);
      const rightEyeCenter = mid(rightCornerA, rightCornerB);
      const leftEyeWidth = Math.max(1e-6, dist(leftCornerA, leftCornerB));
      const rightEyeWidth = Math.max(1e-6, dist(rightCornerA, rightCornerB));

      // 3) iris 편차를 ‘눈 폭’으로 정규화 (양 눈 평균)
      const leftOffset = dist(leftIris, leftEyeCenter) / leftEyeWidth; // 0 ~ 1+
      const rightOffset = dist(rightIris, rightEyeCenter) / rightEyeWidth;
      const gazeOffset = (leftOffset + rightOffset) / 2;

      // 4) 임계치로 판정 (처음엔 0.35~0.45로 시작해 튜닝)
      const isFocused = gazeOffset < 0.4;

      // 5) focusLog & focusRate 갱신 (매 프레임)
      setConcentrationData((prev) => {
        const nextLog = [...prev.focusData.focusLog.slice(-19), isFocused];
        const frRaw = (nextLog.filter(Boolean).length / nextLog.length) * 100;
        const prevSmooth = prev.focusData.smoothedFocusRate ?? frRaw;
        const EMA_ALPHA = 0.25; // 반응성↔안정성 트레이드오프 (0.2~0.35 추천)
        const frSmooth = EMA_ALPHA * frRaw + (1 - EMA_ALPHA) * prevSmooth;
        return {
          ...prev,
          focusData: {
            ...prev.focusData,
            faceDetected: true,
            focusLog: nextLog,
            focusRate: frRaw, // 원시값은 참고용으로 유지
            smoothedFocusRate: frSmooth, // ★ 판정/표시에 사용
          },
        };
      });

      focusLogRef.current = [...focusLogRef.current.slice(-89), isFocused];
      noFaceFrameCount.current = 0;
    } else {
      // 얼굴이 감지되지 않음 - 5초마다 한 번씩만 로그 출력

      noFaceFrameCount.current += 1;
      if (noFaceFrameCount.current >= 6) {
        // 약 200ms 후 미감지 확정
        setConcentrationData((prev) => {
          const nextLog = [...prev.focusData.focusLog.slice(-19), false];
          const frRaw = (nextLog.filter(Boolean).length / nextLog.length) * 100;
          const prevSmooth = prev.focusData.smoothedFocusRate ?? frRaw;
          const EMA_ALPHA = 0.25;
          const frSmooth = EMA_ALPHA * frRaw + (1 - EMA_ALPHA) * prevSmooth;
          return {
            ...prev,
            focusData: {
              ...prev.focusData,
              faceDetected: false,
              focusLog: nextLog,
              attentionScore: 0,
              focusRate: frRaw,
              smoothedFocusRate: frSmooth,
            },
          };
        });
      }

      focusLogRef.current = [...focusLogRef.current.slice(-89), false];
    }
  };

  // 카메라 초기화
  const initializeCamera = async () => {
    if (!videoRef.current) {
      console.error("❌ videoRef가 없습니다");
      return;
    }

    try {
      // 기존 카메라 정리
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current = null;
      }

      // FaceMesh 초기화
      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.3, // 감지 임계값 낮춤
        minTrackingConfidence: 0.3, // 추적 임계값 낮춤
      });

      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;
      console.log("✅ FaceMesh 초기화 완료");

      // 카메라 초기화
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraRef.current = camera;
      console.log("✅ 카메라 시작 완료");

      // 카메라 권한 확인
      setTimeout(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          console.log("✅ 비디오 스트림 활성화됨");
        } else {
          console.log("❌ 비디오 스트림이 활성화되지 않음");
        }
      }, 2000);
    } catch (error) {
      console.error("❌ 카메라 초기화 실패:", error);
    }
  };

  // 집중도 점수 계산 (개선된 버전)
  const calculateConcentrationScore = () => {
    const {
      suspiciouslyFastAnswers,
      maxConsecutiveWrong,
      inactivityPeriods,
      focusData,
    } = concentrationData;

    let issues = 0;

    // 1. 비정상적으로 빠른 응답 (가중치 감소)
    issues += suspiciouslyFastAnswers * 0.5;

    // 2. 연속 오답 패턴 (임계값 완화)
    if (maxConsecutiveWrong > 8) {
      issues += Math.floor(maxConsecutiveWrong / 5);
    }

    // 3. 비활성 시간 (가중치 감소)
    issues += inactivityPeriods.length * 0.5;

    // 4. 카메라 기반 집중도 이슈 (더 관대한 기준)
    if (focusData.focusLog.length >= 20) {
      // 30초에서 20초로 단축
      const recentFocus = focusData.focusLog.slice(-20);
      const focusRate = recentFocus.filter((x) => x).length / 20;

      if (focusRate < 0.3) {
        // 0.5에서 0.3으로 완화
        issues += Math.floor((0.3 - focusRate) * 5);
      }
    }

    if (!focusData.faceDetected) {
      issues += 2; // 얼굴 미감지 시 더 큰 페널티
    }

    return Math.min(issues, 8); // 최대 8점으로 감소
  };

  // 실시간 집중도 체크
  const checkFocusLevel = () => {
    if (focusLogRef.current.length < 20) return;
    // EMA 결과(0~100)를 쓰자. onFaceMeshResults에서 이미 갱신됨.
    const frSmooth = concentrationData.focusData.smoothedFocusRate ?? 0;
    const now = Date.now();

    // 연속 판정 누적
    if (frSmooth < HYST_LOW) {
      belowStreak.current += 1;
      aboveStreak.current = 0;
    } else if (frSmooth > HYST_HIGH) {
      aboveStreak.current += 1;
      belowStreak.current = 0;
    } else {
      // 중간 영역이면 둘 다 리셋
      belowStreak.current = 0;
      aboveStreak.current = 0;
    }

    // 디바운스: 최소 표시시간 충족 시에만 상태 전환
    const canFlip = now - (lastAlertChangeAt.current || 0) > MIN_ALERT_MS;

    setConcentrationData((prev) => {
      let issues = prev.concentrationIssues;
      let flipped = false;

      if (
        alertStatus.current === "normal" &&
        belowStreak.current >= HOLD_EVALS &&
        canFlip
      ) {
        // 낮음으로 전환
        alertStatus.current = "low";
        lastAlertChangeAt.current = now;
        flipped = true;
        issues = issues + 1; // 정책에 맞게 조정
      } else if (
        alertStatus.current === "low" &&
        aboveStreak.current >= HOLD_EVALS &&
        canFlip
      ) {
        // 정상으로 해제
        alertStatus.current = "normal";
        lastAlertChangeAt.current = now;
        flipped = true;
        issues = Math.max(0, issues - 0.3); // 정책에 맞게 조정
      }

      if (!flipped) return prev; // 상태 변동 없으면 리렌더 억제
      return { ...prev, concentrationIssues: issues };
    });

    // 집중도가 낮으면 이슈 추가 (더 엄격한 기준)
    if (frSmooth < 0.6) {
      setConcentrationData((prev) => {
        const newData = {
          ...prev,
          concentrationIssues: prev.concentrationIssues + 1,
        };
        return newData;
      });
    } else if (frSmooth > 0.85) {
      // 집중도가 매우 좋을 때만 이슈 감소 (0.8에서 0.85로 더 엄격하게)
      setConcentrationData((prev) => {
        const newData = {
          ...prev,
          concentrationIssues: Math.max(0, prev.concentrationIssues - 0.3),
        };
        return newData;
      });
    }
  };

  // 세션 종료 시 데이터 반환
  const getSessionData = () => {
    return {
      sessionId,
      studentId,
      duration: (Date.now() - sessionStartTime.current) / 1000,
      concentrationData,
      concentrationScore: calculateConcentrationScore(),
    };
  };

  useEffect(() => {
    // 30초마다 비활성 체크
    inactivityTimer.current = setInterval(detectInactivity, 30000);

    // 사용자 활동 이벤트 리스너 (태블릿 환경 고려)
    const events = [
      "mousemove",
      "click",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity);
    });

    // 카메라 권한 요청 및 초기화
    const requestCameraPermission = async () => {
      try {
        console.log("📹 카메라 권한 요청 중...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user", // 전면 카메라 사용
          },
        });
        console.log("✅ 카메라 권한 획득");
        stream.getTracks().forEach((track) => track.stop()); // 임시 스트림 정리

        // 권한 획득 후 카메라 초기화
        setTimeout(() => {
          initializeCamera();
        }, 500);
      } catch (error) {
        console.error("❌ 카메라 권한 거부:", error);
        // console.log("💡 브라우저 설정에서 카메라 권한을 허용해주세요");
      }
    };

    requestCameraPermission();

    // 1초마다 집중도 체크 (더 빠른 반응)
    const focusCheckInterval = setInterval(checkFocusLevel, 3000);

    return () => {
      if (inactivityTimer.current) {
        clearInterval(inactivityTimer.current);
      }
      if (focusCheckInterval) {
        clearInterval(focusCheckInterval);
      }
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });

      // 카메라 정리
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  return {
    startQuestionTimer,
    endQuestionTimer,
    updateActivity,
    getSessionData,
    concentrationData,
    videoRef, // 비디오 요소 참조 반환
  };
};

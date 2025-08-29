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
  const lastLogTime = useRef(0);

  // 카메라 관련 refs (videoRef는 외부에서 받음)
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const focusLogRef = useRef([]);

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

  // 문제 완료 시 호출
  const endQuestionTimer = (isCorrect) => {
    if (!questionStartTime.current) return;

    const solvingTime = (Date.now() - questionStartTime.current) / 1000; // 초 단위

    setConcentrationData((prev) => {
      const newSolvingTimes = [...prev.questionSolvingTimes, solvingTime];

      let newSuspiciouslyFast = prev.suspiciouslyFastAnswers;
      let newSuspiciouslySlow = prev.suspiciouslySlowAnswers;

      if (solvingTime < 2) {
        newSuspiciouslyFast += 1;
        console.log("⚡ 빠른 응답:", solvingTime.toFixed(1) + "초");
      } else if (solvingTime > 60) {
        newSuspiciouslySlow += 1;
        console.log("🐌 느린 응답:", solvingTime.toFixed(1) + "초");
      }

      // 연속 오답 패턴 업데이트
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
        questionSolvingTimes: newSolvingTimes,
        suspiciouslyFastAnswers: newSuspiciouslyFast,
        suspiciouslySlowAnswers: newSuspiciouslySlow,
        consecutiveWrongAnswers: newConsecutiveWrong,
        maxConsecutiveWrong: newMaxConsecutiveWrong,
        inactivityPeriods: [], // 답변 제출 시 비활성 시간 기록 초기화
      };
    });

    lastActivityTime.current = Date.now();
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
      const landmarks = results.multiFaceLandmarks[0];

      // 눈 추적 데이터 (468: 왼쪽 눈, 473: 오른쪽 눈)
      const leftEye = landmarks[468];
      const rightEye = landmarks[473];

      // 머리 위치 데이터 (33: 왼쪽 눈꼬리, 263: 오른쪽 눈꼬리)
      const leftEyeCorner = landmarks[33];
      const rightEyeCorner = landmarks[263];

      // 집중도 계산 (눈의 중앙과 화면 중앙의 거리)
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const eyeCenterY = (leftEye.y + rightEye.y) / 2;
      const screenCenterX = 0.5; // 화면 중앙
      const screenCenterY = 0.5;

      const distanceFromCenter = Math.sqrt(
        Math.pow(eyeCenterX - screenCenterX, 2) +
          Math.pow(eyeCenterY - screenCenterY, 2)
      );

      // 집중도 판단 (거리가 0.15 이하면 집중 - 더 엄격하게)
      const isFocused = distanceFromCenter < 0.15;

      // 머리 기울기 계산
      const headTilt = Math.abs(leftEyeCorner.x - rightEyeCorner.x);
      const isHeadStraight = headTilt < 0.05;

      // 눈 크기로 집중도 판단 (눈을 크게 뜨고 있는지)
      const leftEyeSize = Math.sqrt(
        Math.pow(landmarks[33].x - landmarks[133].x, 2) +
          Math.pow(landmarks[33].y - landmarks[133].y, 2)
      );
      const rightEyeSize = Math.sqrt(
        Math.pow(landmarks[362].x - landmarks[263].x, 2) +
          Math.pow(landmarks[362].y - landmarks[263].y, 2)
      );
      const averageEyeSize = (leftEyeSize + rightEyeSize) / 2;
      const isEyesOpen = averageEyeSize > 0.02; // 눈이 충분히 열려있는지

      // 종합 집중도 점수 (모든 조건을 만족해야 집중)
      const attentionScore = isFocused && isHeadStraight && isEyesOpen ? 1 : 0;

      // 10초마다 한 번씩만 로그 출력 (얼굴 감지 상태 확인)
      const now = Date.now();
      if (now - lastLogTime.current > 10000) {
        console.log("👁️ 얼굴 감지됨:", {
          focusRate: isFocused ? "집중" : "분산",
          distance: distanceFromCenter.toFixed(2),
          headTilt: headTilt.toFixed(2),
          eyeSize: averageEyeSize.toFixed(3),
          eyesOpen: isEyesOpen ? "열림" : "감음",
          attentionScore: attentionScore === 1 ? "집중" : "분산",
          landmarks: results.multiFaceLandmarks.length,
        });
        lastLogTime.current = now;
      }

      setConcentrationData((prev) => ({
        ...prev,
        focusData: {
          ...prev.focusData,
          faceDetected: true,
          focusLog: [...prev.focusData.focusLog.slice(-89), isFocused],
          eyeTrackingData: [
            ...prev.focusData.eyeTrackingData.slice(-29),
            {
              x: eyeCenterX,
              y: eyeCenterY,
              distance: distanceFromCenter,
            },
          ],
          headPoseData: [
            ...prev.focusData.headPoseData.slice(-29),
            {
              tilt: headTilt,
              isStraight: isHeadStraight,
            },
          ],
          attentionScore,
        },
      }));

      focusLogRef.current = [...focusLogRef.current.slice(-89), isFocused];

      // focusLogRef 업데이트 확인 (10초마다 한 번씩)
      if (now - lastLogTime.current > 10000) {
        console.log("📝 focusLogRef 업데이트:", {
          length: focusLogRef.current.length,
          latestValue: isFocused,
          recentValues: focusLogRef.current.slice(-5),
        });
        lastLogTime.current = now;
      }
    } else {
      // 얼굴이 감지되지 않음 - 5초마다 한 번씩만 로그 출력
      const now = Date.now();
      if (now - lastLogTime.current > 5000) {
        console.log("🚫 얼굴 미감지 - 카메라 앞에 앉아주세요");
        lastLogTime.current = now;
      }

      setConcentrationData((prev) => ({
        ...prev,
        focusData: {
          ...prev.focusData,
          faceDetected: false,
          focusLog: [...prev.focusData.focusLog.slice(-89), false],
          attentionScore: 0,
        },
      }));

      focusLogRef.current = [...focusLogRef.current.slice(-89), false];

      // focusLogRef 업데이트 확인 (얼굴 미감지 시)
      if (now - lastLogTime.current > 5000) {
        console.log("📝 focusLogRef 업데이트 (얼굴 미감지):", {
          length: focusLogRef.current.length,
          latestValue: false,
          recentValues: focusLogRef.current.slice(-5),
        });
        lastLogTime.current = now;
      }
    }
  };

  // 카메라 초기화
  const initializeCamera = async () => {
    if (!videoRef.current) {
      console.log("❌ videoRef가 없습니다");
      return;
    }

    try {
      console.log("📹 카메라 초기화 시작...");

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
    const now = Date.now();
    // 5초마다 한 번씩만 로그 출력
    if (now - lastLogTime.current > 5000) {
      console.log("🔍 집중도 체크:", {
        focusLogLength: focusLogRef.current.length,
        focusLogData: focusLogRef.current.slice(-5), // 최근 5개 데이터
      });
      lastLogTime.current = now;
    }

    if (focusLogRef.current.length >= 20) {
      // 30초에서 20초로 단축
      const recent = focusLogRef.current.slice(-20);
      const focusRate = recent.filter((x) => x).length / 20;

      // 5초마다 한 번씩만 로그 출력
      if (now - lastLogTime.current > 5000) {
        console.log("📊 집중도 계산:", {
          recentData: recent,
          focusCount: recent.filter((x) => x).length,
          totalCount: recent.length,
          focusRate: (focusRate * 100).toFixed(1) + "%",
        });
        lastLogTime.current = now;
      }

      setConcentrationData((prev) => ({
        ...prev,
        focusData: {
          ...prev.focusData,
          focusRate: focusRate * 100,
        },
      }));

      // 집중도가 낮으면 이슈 추가 (더 엄격한 기준)
      if (focusRate < 0.6) {
        // 0.5에서 0.6으로 더 엄격하게 조정
        setConcentrationData((prev) => {
          const newData = {
            ...prev,
            concentrationIssues: prev.concentrationIssues + 1,
          };
          console.log("📉 집중도 낮음:", {
            focusRate: (focusRate * 100).toFixed(1) + "%",
            issues: newData.concentrationIssues,
          });
          return newData;
        });
      } else if (focusRate > 0.85) {
        // 집중도가 매우 좋을 때만 이슈 감소 (0.8에서 0.85로 더 엄격하게)
        setConcentrationData((prev) => {
          const newData = {
            ...prev,
            concentrationIssues: Math.max(0, prev.concentrationIssues - 0.3),
          };
          console.log("📈 집중도 좋음:", {
            focusRate: (focusRate * 100).toFixed(1) + "%",
            issues: newData.concentrationIssues,
          });
          return newData;
        });
      }
    } else {
      // 5초마다 한 번씩만 로그 출력
      if (now - lastLogTime.current > 5000) {
        console.log(
          "⏳ 집중도 데이터 수집 중:",
          focusLogRef.current.length + "/20"
        );
        lastLogTime.current = now;
      }
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
        console.log("💡 브라우저 설정에서 카메라 권한을 허용해주세요");
      }
    };

    requestCameraPermission();

    // 1초마다 집중도 체크 (더 빠른 반응)
    const focusCheckInterval = setInterval(checkFocusLevel, 5000);

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

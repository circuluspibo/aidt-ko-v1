// 전역 상태 관리
let currentLevel = 'consonant';
let currentItemIndex = 0;
let currentRepeat = 1;
let maxRepeat = 3;
let isRecording = false;
let recognition = null;
let startTime = null;
let sessionStartTime = new Date();

// 반복 설정
let repeatSettings = {
    correct: 3,
    incorrect: 5
};

// 학습 데이터 분석용
let learningStats = {
    sessionStart: new Date(),
    attempts: [],
    stats: {
        totalCorrect: 0,
        totalIncorrect: 0,
        totalTime: 0,
        currentStreak: 0,
        bestStreak: 0
    }
};

// localStorage 키 정의
const STORAGE_KEYS = {
    PROGRESS: 'korean_learning_progress',
    SETTINGS: 'korean_learning_settings',
    STATS: 'korean_learning_stats',
    SESSION: 'korean_learning_session'
};



// =================
// localStorage 관리 함수들
// =================

// 현재 상태 저장
function saveCurrentState() {
    try {
        const currentState = {
            currentLevel,
            currentItemIndex,
            currentRepeat,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.CURRENT_STATE, JSON.stringify(currentState));
        localStorage.setItem(STORAGE_KEYS.LAST_SAVE, new Date().toISOString());
        
        updateSaveStatus('success', '💾 자동 저장됨');
        return true;
    } catch (error) {
        console.error('저장 실패:', error);
        updateSaveStatus('error', '❌ 저장 실패');
        return false;
    }
}

// 학습 데이터 저장
function savelearningStats() {
    try {
        localStorage.setItem(STORAGE_KEYS.LEARNING_DATA, JSON.stringify(learningStats));
        return true;
    } catch (error) {
        console.error('학습 데이터 저장 실패:', error);
        return false;
    }
}

// 설정 저장
function saveSettings() {
    try {
        const settings = {
            repeatSettings,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('설정 저장 실패:', error);
        return false;
    }
}

// 모든 데이터 저장
function saveAllData() {
    const success = saveCurrentState() && savelearningStats() && saveSettings();
    if (!success) {
        updateSaveStatus('error', '❌ 일부 저장 실패');
    }
    return success;
}

// 저장된 상태 불러오기
function loadSavedState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEYS.CURRENT_STATE);
        const savedData = localStorage.getItem(STORAGE_KEYS.LEARNING_DATA);
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        if (savedState) {
            const state = JSON.parse(savedState);
            const saveDate = new Date(state.timestamp);
            const now = new Date();
            const daysDiff = Math.floor((now - saveDate) / (1000 * 60 * 60 * 24));

            // 7일 이내의 데이터만 복원 제안
            if (daysDiff <= 7) {
                return {
                    state: state,
                    data: savedData ? JSON.parse(savedData) : null,
                    settings: savedSettings ? JSON.parse(savedSettings) : null,
                    isValid: true
                };
            }
        }
        return true;
    } catch (error) {
        console.error('저장된 데이터 불러오기 실패:', error);
        return false;
    }
}

// 진행상황 복원
function restoreProgress() {
    const savedData = loadSavedState();
    if (savedData && savedData.isValid) {
        const { state, data, settings } = savedData;
        
        // 상태 복원
        currentLevel = state.currentLevel;
        currentItemIndex = state.currentItemIndex;
        currentRepeat = state.currentRepeat;
        
        // 학습 데이터 복원
        if (data) {
            learningStats = { ...learningStats, ...data };
        }
        
        // 설정 복원
        if (settings && settings.repeatSettings) {
            repeatSettings = settings.repeatSettings;
            document.getElementById('correctRepeat').textContent = repeatSettings.correct;
            document.getElementById('incorrectRepeat').textContent = repeatSettings.incorrect;
        }
        
        // UI 업데이트
        selectLevel(currentLevel);
        updateContent();
        updateUI();
        
        updateTutorMessage('📚 복원 완료', 
            `이전 학습이 복원되었어요! ${getLevelKoreanName(currentLevel)} ${currentItemIndex + 1}번째 문제부터 이어서 진행해요! 🎯`);
        
        hideRestoreModal();
        updateSaveStatus('success', '📚 진행상황 복원됨');
        
        return true;
    }
    return false;
}

function startFresh() {
    // 기본값으로 초기화
    currentLevel = 'consonant';
    currentItemIndex = 0;
    currentRepeat = 1;
    maxRepeat = 3;
    sessionStartTime = new Date();
    
    learningStats = {
        sessionStart: new Date(),
        attempts: [],
        stats: {
            totalCorrect: 0,
            totalIncorrect: 0,
            totalTime: 0,
            currentStreak: 0,
            bestStreak: 0
        }
    };
    
    // UI 업데이트
    updateLevelButtons();
    updateContent();
    updateProgressDisplay();
    updateStatsDisplay();
    //updateSessionInfo();
    
    hideRestoreModal();
    
    updateTutorMessage('🆕 새로운 시작!', 
        '새로운 학습 세션을 시작합니다! 한글 발음 연습을 차근차근 해보아요! 🎤');
}

function hideRestoreModal() {
    document.getElementById('restoreModal').style.display = 'none';
}

function resetProgress() {
    if (confirm('정말로 모든 학습 데이터를 초기화하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.')) {
        try {
            // localStorage 완전 삭제
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // 상태 초기화
            startFresh();
            
            updateTutorMessage('🔄 초기화 완료!', 
                '모든 학습 데이터가 초기화되었습니다. 처음부터 새로 시작해보세요! 🎯');
                
        } catch (error) {
            console.error('초기화 중 오류 발생:', error);
            updateTutorMessage('❌ 초기화 실패', '초기화 중 오류가 발생했습니다.');
        }
    }
}

function exportLearningData() {
    try {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            progress: {
                currentLevel,
                currentItemIndex,
                currentRepeat,
                maxRepeat
            },
            settings: repeatSettings,
            stats: learningStats,
            sessionInfo: {
                sessionStart: sessionStartTime,
                totalSessionTime: (new Date() - sessionStartTime) / 1000
            }
        };
        
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `korean_learning_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        updateTutorMessage('📤 내보내기 완료!', 
            '학습 데이터가 성공적으로 내보내졌습니다! 파일을 안전한 곳에 보관해주세요! 💾');
            
    } catch (error) {
        console.error('내보내기 중 오류 발생:', error);
        updateTutorMessage('❌ 내보내기 실패', '데이터 내보내기 중 오류가 발생했습니다.');
    }
}

function importLearningData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // 데이터 유효성 검증
            if (!importData.version || !importData.progress || !importData.settings || !importData.stats) {
                throw new Error('잘못된 파일 형식입니다.');
            }
            
            if (confirm('가져온 데이터로 현재 학습 상황을 덮어쓰시겠습니까?\n\n⚠️ 현재 데이터는 사라집니다.')) {
                // 데이터 복원
                currentLevel = importData.progress.currentLevel || 'consonant';
                currentItemIndex = importData.progress.currentItemIndex || 0;
                currentRepeat = importData.progress.currentRepeat || 1;
                maxRepeat = importData.progress.maxRepeat || 3;
                
                repeatSettings = { ...repeatSettings, ...importData.settings };
                learningStats = { ...learningStats, ...importData.stats };
                learningStats.sessionStart = new Date(); // 새 세션으로 시작
                
                // localStorage에 저장
                saveAllData();
                
                // UI 업데이트
                updateLevelButtons();
                updateContent();
                updateProgressDisplay();
                updateStatsDisplay();
                updateSessionInfo();
                document.getElementById('correctRepeat').textContent = repeatSettings.correct;
                document.getElementById('incorrectRepeat').textContent = repeatSettings.incorrect;
                
                updateTutorMessage('📥 가져오기 완료!', 
                    '백업 데이터를 성공적으로 불러왔습니다! 이전 학습 상태로 복원되었어요! 🎉');
            }
            
        } catch (error) {
            console.error('가져오기 중 오류 발생:', error);
            updateTutorMessage('❌ 가져오기 실패', '파일을 읽는 중 오류가 발생했습니다. 올바른 백업 파일인지 확인해주세요.');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // 파일 입력 초기화
}

// 자동 저장 (30초마다)
function setupAutoSave() {
    setInterval(() => {
        try {
            const progressData = {
                currentLevel,
                currentItemIndex,
                currentRepeat,
                maxRepeat,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressData));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(repeatSettings));
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(learningStats));
            
        } catch (error) {
            console.warn('자동 저장 실패:', error);
        }
    }, 30000); // 30초마다 자동 저장
}

// 세션 정보 업데이트
function updateSessionInfo() {
    const sessionInfo = document.getElementById('sessionInfo');
    const startTime = sessionStartTime.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const sessionDuration = Math.floor((new Date() - sessionStartTime) / 1000 / 60);
    
    sessionInfo.textContent = `세션: ${startTime} (${sessionDuration}분)`;
}

// 유틸리티 함수들
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
        return `${minutes}분 전`;
    } else {
        return `${hours}시간 전`;
    }
}

function getLevelName(level) {
    const names = {
        consonant: '자음',
        vowel: '모음',
        combination: '글자',
        word: '단어'
    };
    return names[level] || '알 수 없음';
}

function updateLevelButtons() {
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === getLevelName(currentLevel)) {
            btn.classList.add('active');
        }
    });
}

// 음성 인식 초기화
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    } else {
        updateVoiceFeedback('음성 인식을 지원하지 않는 브라우저입니다.');
        return false;
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onstart = function() {
        isRecording = true;
        startTime = new Date();
        updateMicStatus('listening');
        updateVoiceFeedback('듣고 있습니다... 말해보세요!');
    };

    recognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            processVoiceInput(finalTranscript.trim());
        } else if (interimTranscript) {
            updateRecognizedText(interimTranscript);
        }
    };

    recognition.onerror = function(event) {
        isRecording = false;
        updateMicStatus('error');
        updateVoiceFeedback('음성 인식 오류가 발생했습니다. 다시 시도해주세요.');
    };

    recognition.onend = function() {
        isRecording = false;
        updateMicButton();
    };

    return true;
}

// 음성 입력 처리
function processVoiceInput(input) {
    const endTime = new Date();
    const responseTime = (endTime - startTime) / 1000;
    
    const currentItem = getCurrentItem();
    const targetText = getTargetText(currentItem);
    
    // 정답 판정 (유사도 검사)
    const isCorrect = checkPronunciation(input, targetText);
    
    // 학습 데이터 저장
    recordAttempt(input, targetText, isCorrect, responseTime);
    
    updateRecognizedText(input);
    
    if (isCorrect) {
        handleCorrectAnswer(responseTime);
    } else {
        handleIncorrectAnswer(input, targetText);
    }
}

// 발음 정확도 검사
function checkPronunciation(input, target) {
    const normalizedInput = input.replace(/\s+/g, '').replace(/./g, '').toLowerCase();
    const normalizedTarget = target.replace(/\s+/g, '').replace(/./g, '').toLowerCase();
    
    if (normalizedInput === normalizedTarget) return true;
    
    const similarity = calculateSimilarity(normalizedInput, normalizedTarget);
    console.log(input, target, similarity);
    return similarity >= 0.7;
}

// 문자열 유사도 계산
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// 편집 거리 계산 (Levenshtein Distance)
function getEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// 학습 시도 기록
function recordAttempt(input, target, isCorrect, responseTime) {
    const attempt = {
        timestamp: new Date(),
        level: currentLevel,
        itemIndex: currentItemIndex,
        target: target,
        input: input,
        isCorrect: isCorrect,
        responseTime: responseTime,
        repeatCount: currentRepeat
    };
    
    learningStats.attempts.push(attempt);
    
    if (isCorrect) {
        learningStats.stats.totalCorrect++;
        learningStats.stats.currentStreak++;
        learningStats.stats.bestStreak = Math.max(
            learningStats.stats.bestStreak, 
            learningStats.stats.currentStreak
        );
    } else {
        learningStats.stats.totalIncorrect++;
        learningStats.stats.currentStreak = 0;
    }
    
    learningStats.stats.totalTime += responseTime;
    updateStatsDisplay();
}

// 통계 표시 업데이트
function updateStatsDisplay() {
    const stats = learningStats.stats;
    const totalAttempts = stats.totalCorrect + stats.totalIncorrect;
    const accuracy = totalAttempts > 0 ? (stats.totalCorrect / totalAttempts * 100) : 100;
    const avgTime = totalAttempts > 0 ? (stats.totalTime / totalAttempts) : 0;
    
    document.getElementById('currentProgress').textContent = stats.totalCorrect;
    document.getElementById('repeatProgress').textContent = stats.totalIncorrect;
    document.getElementById('accuracy').textContent = accuracy.toFixed(1) + '%';
    document.getElementById('avgTime').textContent = avgTime.toFixed(1) + 's';
}

// 정답 처리
function handleCorrectAnswer(responseTime) {
    updateMicStatus('success');
    updateVoiceFeedback(`정답입니다! (${responseTime.toFixed(1)}초)`);
    
    if (currentRepeat >= maxRepeat) {
        setTimeout(() => {
            showFeedback(true, true);
            nextItem();
        }, 1500);
    } else {
        currentRepeat++;
        updateRepeatDisplay();
        setTimeout(() => {
            showFeedback(true, false);
            generateRandomHint();
        }, 1500);
    }
}

// 오답 처리
function handleIncorrectAnswer(input, target) {
    updateMicStatus('error');
    updateVoiceFeedback(`다시 해보세요. "${target}"라고 말해보세요.`);
    
    maxRepeat = repeatSettings.incorrect;
    updateRepeatDisplay();
    
    setTimeout(() => {
        showFeedback(false, false);
        updateMicStatus('ready');
    }, 2000);
}

// 현재 학습 항목 가져오기
function getCurrentItem() {
    return learningData[currentLevel][currentItemIndex];
}

// 목표 텍스트 가져오기
function getTargetText(item) {
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            return item.name; // item.letter;
        case 'combination':
            return item.result;
        case 'word':
            return item.word;
        default:
            return '';
    }
}

// 랜덤 힌트 생성
function generateRandomHint() {
    const currentItem = getCurrentItem()
    const hints = currentItem.example;
    const randomHint = hints;
    
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            document.getElementById('hintImage').textContent = currentItem.image;
            document.getElementById('hintExample').textContent = currentItem.example;
            document.getElementById('hintDescription').textContent = `이번에는 "${currentItem.example}"를 생각하며 발음해보세요!`;
            break;
        case 'combination':
            document.getElementById('hintImage').textContent = currentItem.image;
            document.getElementById('hintExample').textContent = currentItem.meaning;
            document.getElementById('hintDescription').textContent = `이번에는 "${currentItem.meaning}"를 생각하며 발음해보세요!`;
            break;
        case 'word':
            document.getElementById('hintImage').textContent = currentItem.image;
            document.getElementById('hintExample').textContent = currentItem.meaning;
            document.getElementById('hintDescription').textContent = `이번에는 "${currentItem.meaning}"를 생각하며 발음해보세요!`;
            break;
    }

    
    updateTutorMessage('🎯 새로운 힌트!', 
        `이번에는 "${currentItem.example}"를 생각하며 발음해보세요! ${currentItem.description} 🎪`);
}

// UI 업데이트 함수들
function updateMicStatus(status) {
    const micStatus = document.getElementById('micStatus');
    const micButton = document.getElementById('micButton');
    
    micStatus.className = 'mic-status';
    micButton.className = 'mic-button';
    
    switch(status) {
        case 'listening':
            micStatus.classList.add('listening');
            micButton.classList.add('listening');
            micStatus.textContent = '🔴';
            micButton.textContent = '🔴';
            break;
        case 'success':
            micStatus.classList.add('success');
            micButton.classList.add('success');
            micStatus.textContent = '✅';
            micButton.textContent = '✅';
            break;
        case 'error':
            micStatus.textContent = '❌';
            micButton.textContent = '❌';
            break;
        default:
            micStatus.textContent = '🎤';
            micButton.textContent = '🎤';
    }
}

function updateMicButton() {
    const micButton = document.getElementById('micButton');
    if (isRecording) {
        micButton.classList.add('listening');
        micButton.textContent = '🔴';
    } else {
        micButton.classList.remove('listening');
        micButton.textContent = '🎤';
    }
}

function updateVoiceFeedback(message) {
    document.getElementById('voiceFeedback').textContent = message;
}

function updateRecognizedText(text) {
    const element = document.getElementById('recognizedText');
    element.textContent = `인식된 음성: "${text}"`;
    element.style.display = 'block';
}

function updateRepeatDisplay() {
    document.getElementById('currentProgress').textContent = `${currentRepeat}/${maxRepeat}`;
}

function updateProgressDisplay() {
    const total = learningData[currentLevel].length;
    const levelNames = {
        consonant: '자음',
        vowel: '모음', 
        combination: '글자',
        word: '단어'
    };
    
    const currentItem = getCurrentItem();
    const targetText = getTargetText(currentItem);
    
    document.getElementById('currentProgress').textContent = 
        `${levelNames[currentLevel]} '${targetText}' (${currentItemIndex + 1}/${total})`;
}

// 레벨 선택
function selectLevel(level) {
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentLevel = level;
    currentItemIndex = 0;
    resetItemState();
    updateContent();
    updateProgressDisplay();
    
    // 자동 저장
    saveAllData();
}

// 항목 상태 리셋
function resetItemState() {
    currentRepeat = 1;
    maxRepeat = repeatSettings.correct;
    updateRepeatDisplay();
    updateMicStatus('ready');
    document.getElementById('recognizedText').style.display = 'none';
}

// 콘텐츠 업데이트
function updateContent() {
    const currentItem = getCurrentItem();
    const targetText = getTargetText(currentItem);
    generateRandomHint()
    
    // 기본 정보 업데이트
    document.getElementById('targetLetter').textContent = targetText;
    
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            document.getElementById('targetInfo').textContent = currentItem.name;
            document.getElementById('pronunciationGuide').textContent = currentItem.sound;
            break;
        case 'combination':
            document.getElementById('targetInfo').textContent = 
                `${currentItem.consonant} + ${currentItem.vowel}`;
            document.getElementById('pronunciationGuide').textContent = currentItem.sound;
            break;
        case 'word':
            document.getElementById('targetInfo').textContent = 
                currentItem.syllables.join(' + ');
            document.getElementById('pronunciationGuide').textContent = currentItem.sound;
            break;
    }
    
    // 첫 번째 힌트로 설정
    //const firstHint = currentItem.example;
    //document.getElementById('hintImage').textContent = firstHint.image;
    //document.getElementById('hintExample').textContent = firstHint.example;
    //document.getElementById('hintDescription').textContent = firstHint.description;
    
    updateLevelMessage();
}

// 레벨별 메시지 업데이트
function updateLevelMessage() {
    const currentItem = getCurrentItem();
    const targetText = getTargetText(currentItem);
    
    console.log(currentItem)

    const messages = {
        consonant: {
            title: '🗣️ 자음 발음 연습',
            subtitle: `'${targetText}' 소리내어 읽기`,
            message: `자음 '${targetText}'를 정확하게 발음해보세요! ${currentItem.name} 소리를 또렷하게 말해보세요! 🎤`
        },
        vowel: {
            title: '🗣️ 모음 발음 연습',
            subtitle: `'${targetText}' 소리내어 읽기`,
            message: `모음 '${targetText}'를 정확하게 발음해보세요! ${currentItem.name} 소리를 길게 늘여서 말해보세요! 🎵`
        },
        combination: {
            title: '🗣️ 글자 발음 연습',
            subtitle: `'${targetText}' 소리내어 읽기`,
            message: `글자 '${targetText}'를 정확하게 발음해보세요! ${currentItem.consonant}과 ${currentItem.vowel}이 합쳐진 소리예요! ✨`
        },
        word: {
            title: '🗣️ 단어 발음 연습',
            subtitle: `'${targetText}' 소리내어 읽기`,
            message: `단어 '${targetText}'를 정확하게 발음해보세요! ${currentItem.letter}을 이어서 말해보세요! 🏆`
        }
    };
    
    const levelInfo = messages[currentLevel];
    document.getElementById('lessonTitle').textContent = levelInfo.title;
    document.getElementById('lessonSubtitle').textContent = levelInfo.subtitle;
    updateTutorMessage(levelInfo.title, levelInfo.message);
}

// 설정 토글
// 토글 기능
function toggleSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const arrow = document.getElementById(sectionName + 'Arrow');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        arrow.classList.remove('rotated');
        arrow.textContent = '▼';
    } else {
        content.classList.add('active');
        arrow.classList.add('rotated');
        arrow.textContent = '▲';
    }
}


function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('expanded');
}

// 반복 횟수 조정
function adjustRepeat(type, delta) {
    const newValue = repeatSettings[type] + delta;
    if (newValue >= 1 && newValue <= 10) {
        repeatSettings[type] = newValue;
        document.getElementById(type + 'Repeat').textContent = newValue;
        
        updateTutorMessage('⚙️ 설정 변경', 
            `${type === 'correct' ? '성공시' : '실패시'} 반복 횟수가 ${newValue}회로 설정되었습니다! 👍`);
        
        // 자동 저장
        saveAllData();
    }
}

// 음성 녹음 토글
function toggleRecording() {
    if (!recognition) {
        updateVoiceFeedback('음성 인식이 지원되지 않습니다.');
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        document.getElementById('recognizedText').style.display = 'none';
        recognition.start();
    }
}

// 목표 음성 재생 (TTS)
function playTargetSound() {
    const currentItem = getCurrentItem();
    const targetText = getTargetText(currentItem);
    
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(targetText);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.6;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
        
        updateTutorMessage('🔊 발음 듣기', 
            `"${targetText}" 소리를 잘 들어보세요. 똑같이 따라 말해보세요! 🎧`);
    }
}

// 발음 재시도
function retryPronunciation() {
    resetItemState();
    generateRandomHint();
    updateTutorMessage('🔄 다시 도전!', 
        '괜찮아요! 천천히 다시 해보세요. 힌트를 참고해서 정확하게 발음해보세요! 💪');
}

// 다음 문제
function nextItem() {
    const maxIndex = learningData[currentLevel].length - 1;
    
    if (currentItemIndex < maxIndex) {
        currentItemIndex++;
        resetItemState();
        updateContent();
        updateProgressDisplay();
        generateRandomHint();
        
        // 자동 저장
        saveAllData();
    } else {
        showLevelComplete();
    }
}

// 레벨 완료
function showLevelComplete() {
    const levelNames = {
        consonant: '자음 발음',
        vowel: '모음 발음',
        combination: '글자 발음',
        word: '단어 발음'
    };
    
    updateTutorMessage('🏆 단계 완료!', 
        `${levelNames[currentLevel]} 연습을 모두 완료했습니다! 정말 대단해요! 다음 단계로 넘어가볼까요? 🎉`);
    
    showFeedback(true, true, '단계 완료!');
    
    // 완료 시 자동 저장
    saveAllData();
}

// 피드백 표시
function showFeedback(isCorrect, isComplete, customText = null) {
    const overlay = document.getElementById('feedbackOverlay');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');
    
    if (customText) {
        icon.textContent = '🏆';
        text.textContent = customText;
    } else if (isCorrect) {
        if (isComplete) {
            icon.textContent = '🎉';
            text.textContent = '완벽해요! 다음 문제로!';
        } else {
            icon.textContent = '✨';
            text.textContent = '잘했어요! 한 번 더!';
        }
    } else {
        icon.textContent = '💪';
        text.textContent = '괜찮아요! 다시 도전!';
    }
    
    overlay.style.display = 'flex';
    setTimeout(() => closeFeedback(), 2000);
}

// 피드백 닫기
function closeFeedback() {
    document.getElementById('feedbackOverlay').style.display = 'none';
}

// AI 튜터 메시지 업데이트
function updateTutorMessage(title, message) {
    const tutorMessage = document.getElementById('tutorMessage');
    tutorMessage.innerHTML = `<strong>${title}</strong><br><br>${message}`;
}

// 도움말
function getTutorHelp() {
    const helpMessages = {
        consonant: '자음은 한글의 기본 소리예요. 입술과 혀의 위치를 바르게 하고 또렷하게 발음해보세요!',
        vowel: '모음은 자음과 함께 완전한 소리를 만들어요. 입모양을 크게 하고 소리를 길게 내보세요!',
        combination: '자음과 모음이 합쳐진 완전한 글자예요. 자음 소리 뒤에 모음 소리를 자연스럽게 이어보세요!',
        word: '완전한 단어예요. 각 음절을 또렷하게 발음하고 자연스럽게 연결해서 말해보세요!'
    };
    
    updateTutorMessage('💡 발음 도움말', helpMessages[currentLevel]);
}

// 지시사항 다시 듣기
function repeatInstruction() {
    const message = document.getElementById('tutorMessage').textContent;
    
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

// 키보드 단축키 설정
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // 입력 필드에서는 단축키 비활성화
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                toggleRecording();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextItem();
                break;
            case 'KeyP':
                event.preventDefault();
                playTargetSound();
                break;
            case 'KeyR':
                event.preventDefault();
                retryPronunciation();
                break;
            case 'KeyH':
                event.preventDefault();
                getTutorHelp();
                break;
            case 'KeyS':
                if (event.ctrlKey) {
                    event.preventDefault();
                    saveAllData();
                }
                break;
        }
    });
}

// 세션 정보 업데이트 (1분마다)
function setupSessionUpdater() {
    setInterval(() => {
        updateSessionInfo();
    }, 60000); // 1분마다 업데이트
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 음성 인식 초기화
    if (!initSpeechRecognition()) {
        updateTutorMessage('⚠️ 알림', 
            '음성 인식이 지원되지 않는 브라우저입니다. Chrome이나 Edge 브라우저를 사용해주세요.');
    }
    
    // 이전 진행 상황 확인 및 복원 제안
    const hasProgress = loadSavedState();
    
    if (!hasProgress) {
        // 새 세션 시작
        selectLevel('consonant');
        startFresh();
    }
    
    // 세션 정보 업데이트
    ///updateSessionInfo();
    

    // 자동 저장 설정
    setupAutoSave();
    
    // 키보드 단축키 설정
    setupKeyboardShortcuts();
    
    // 세션 업데이터 설정
    //setupSessionUpdater();
    
    // 환영 메시지 (복원 알림이 없는 경우만)
    if (!hasProgress) {
        setTimeout(() => {
            updateTutorMessage('👋 환영합니다!', 
                '한글 발음 연습에 오신 것을 환영해요! 마이크 버튼을 누르거나 스페이스바를 눌러서 시작해보세요! 🎤✨');
        }, 1000);
    }
    
    // 단축키 안내
    setTimeout(() => {
        console.log('🎮 단축키 안내:');
        console.log('스페이스바: 음성 녹음 시작/중지');
        console.log('→: 다음 문제');
        console.log('P: 발음 듣기');
        console.log('R: 다시하기');
        console.log('H: 도움말');
        console.log('Ctrl+S: 학습 데이터 저장');
    }, 3000);
});

// 페이지 언로드 시 최종 저장
window.addEventListener('beforeunload', function() {
    try {
        saveAllData();
    } catch (error) {
        console.warn('최종 저장 실패:', error);
    }
});

// 가시성 변경 시 저장 (탭 변경, 앱 최소화 등)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        try {
            saveAllData();
        } catch (error) {
            console.warn('가시성 변경 시 저장 실패:', error);
        }
    }
});
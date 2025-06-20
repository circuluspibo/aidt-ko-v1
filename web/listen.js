
const STORAGE_KEYS = {
    CURRENT_STATE: 'korean_listening_current_state',
    LEARNING_DATA: 'korean_listening_learning_data',
    SETTINGS: 'korean_listening_settings',
    LAST_SAVE: 'korean_listening_last_save'
};

// 전역 상태 관리
let currentLevel = 'consonant';
let currentItemIndex = 0;
let currentRepeat = 1;
let startTime = 0;
let isAnswered = false;

// 반복 설정
let repeatSettings = {
    correct: 3,
    incorrect: 5
};

// 데이터 수집을 위한 변수들
let learningStats = {
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalTime: 0,
    responses: [], // 각 문제별 상세 데이터
    sessionStart: new Date()
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
        return null;
    } catch (error) {
        console.error('저장된 데이터 불러오기 실패:', error);
        return null;
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
        selectLevelButton(currentLevel);
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

// 새로 시작
function startFresh() {
    clearAllSavedData();
    currentLevel = 'consonant';
    currentItemIndex = 0;
    currentRepeat = 1;
    
    // 학습 데이터 리셋
    learningStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalTime: 0,
        responses: [],
        sessionStart: new Date()
    };
    
    selectLevelButton('consonant');
    updateContent();
    updateUI();
    
    hideRestoreModal();
    updateTutorMessage('🌟 새로운 시작', 
        '새로운 학습을 시작해요! 자음부터 차근차근 배워봐요! 💪');
    updateSaveStatus('success', '🌟 새로 시작함');
}

// 저장된 데이터 모두 삭제
function clearAllSavedData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        updateSaveStatus('success', '🗑️ 데이터 초기화됨');
        return true;
    } catch (error) {
        console.error('데이터 삭제 실패:', error);
        updateSaveStatus('error', '❌ 삭제 실패');
        return false;
    }
}

// 저장 상태 표시 업데이트
function updateSaveStatus(type, message) {
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.textContent = message;
    saveStatus.className = type === 'error' ? 'save-status error' : 'save-status';
    
    // 3초 후 기본 메시지로 복원
    setTimeout(() => {
        if (type !== 'error') {
            saveStatus.textContent = '💾 자동 저장됨';
            saveStatus.className = 'save-status';
        }
    }, 3000);
}

// 복원 모달 표시
function showRestoreModal(savedData) {
    const modal = document.getElementById('restoreModal');
    const description = document.getElementById('restoreDescription');
    
    if (savedData && savedData.state) {
        const { currentLevel: level, currentItemIndex: index, currentRepeat: repeat } = savedData.state;
        const levelName = getLevelKoreanName(level);
        const saveDate = new Date(savedData.state.timestamp);
        const timeAgo = getTimeAgo(saveDate);
        
        description.innerHTML = `
            <strong>${levelName} ${index + 1}번째 문제 (${repeat}번째 반복)</strong>에서 중단되었습니다.<br>
            마지막 저장: ${timeAgo}<br><br>
            이어서 학습하시겠어요?
        `;
    }
    
    modal.style.display = 'flex';
}

// 복원 모달 숨기기
function hideRestoreModal() {
    document.getElementById('restoreModal').style.display = 'none';
}

// 시간 차이를 사람이 읽기 쉬운 형태로 변환
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
}

// 초기화 확인
function showResetConfirm() {
    if (confirm('⚠️ 모든 진행상황과 데이터가 삭제됩니다.\n정말 초기화하시겠어요?')) {
        startFresh();
        updateTutorMessage('🔄 초기화 완료', 
            '모든 데이터가 초기화되었어요. 새로운 마음으로 시작해봐요! 🌱');
    }
}

// =================
// 기존 함수들 (수정된 부분)
// =================

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

// 레벨 선택 (저장 기능 추가)
function selectLevel(level) {
    selectLevelButton(level);
    
    currentLevel = level;
    currentItemIndex = 0;
    currentRepeat = 1;
    
    // 콘텐츠 업데이트
    updateContent();
    updateUI();
    
    // 데이터 수집 리셋 (기존 학습은 유지)
    // learningStats.responses = []; // 제거 - 누적된 데이터 유지
    
    // 저장
    saveAllData();
}

// 레벨 버튼 선택 상태 업데이트
function selectLevelButton(level) {
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const levelButtons = document.querySelectorAll('.level-btn');
    const levelIndex = ['consonant', 'vowel', 'combination', 'word'].indexOf(level);
    if (levelIndex >= 0 && levelButtons[levelIndex]) {
        levelButtons[levelIndex].classList.add('active');
    }
}

// 콘텐츠 업데이트 (저장 기능 추가)
function updateContent() {
    const currentData = learningData[currentLevel];
    const currentItem = currentData[currentItemIndex];
    
    // 제목 업데이트
    const levelNames = {
        consonant: '자음 듣기 학습',
        vowel: '모음 듣기 학습',
        combination: '글자 듣기 학습',
        word: '단어 듣기 학습'
    };
    
    document.getElementById('lessonTitle').textContent = levelNames[currentLevel];
    
    // 부제목 업데이트
    let subtitle = '';
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            subtitle = `'${currentItem.letter}' 소리를 듣고 찾아보세요`;
            break;
        case 'combination':
            subtitle = `'${currentItem.result}' 소리를 듣고 찾아보세요`;
            break;
        case 'word':
            subtitle = `'${currentItem.word}' 소리를 듣고 찾아보세요`;
            break;
    }
    document.getElementById('lessonSubtitle').textContent = subtitle;
    
    // 힌트 업데이트 (랜덤하게 선택)
    updateHint();
    
    // 선택지 생성
    generateChoices();
    
    // 타이머 리셋
    startTime = Date.now();
    updateTimer();
    
    // 답변 상태 리셋
    isAnswered = false;
    
    // 저장
    saveCurrentState();
}

// 힌트 업데이트 (랜덤)
function updateHint() {
    const currentData = learningData[currentLevel];
    const currentItem = currentData[currentItemIndex];
    // 키워드에서 랜덤하게 하나 선택
    console.log(currentItem)
    //const randomKeyword = currentItem.keywords[Math.floor(Math.random() * currentItem.keywords.length)];
    
    // 이미지와 설명 업데이트
    document.getElementById('hintImage').textContent = currentItem.image;
    
    let description = '';
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            description = `${currentItem.example}' 소리에요`;
            break;
        case 'combination':
            description = `${currentItem.meaning}' 소리에요`;
            break;
        case 'word':
            description = `${currentItem.meaning} 와 관련있어요`;
            break;
    }
    
    document.getElementById('hintDescription').textContent = description;
}

// 선택지 생성 (랜덤)
function generateChoices() {
    const container = document.getElementById('listeningChoices');
    const currentData = learningData[currentLevel];
    const currentItem = currentData[currentItemIndex];
    
    // 정답 결정
    let correctAnswer;
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            correctAnswer = currentItem.letter;
            break;
        case 'combination':
            correctAnswer = currentItem.result;
            break;
        case 'word':
            correctAnswer = currentItem.word;
            break;
    }
    
    // 오답 선택지 생성 (랜덤하게 4개)
    let wrongAnswers = [];
    const otherItems = currentData.filter((_, index) => index !== currentItemIndex);
    
    // 랜덤하게 섞기
    const shuffledItems = otherItems.sort(() => Math.random() - 0.5);
    
    // 오답 선택지 최대 2개 생성
    for (let i = 0; i < Math.min(2, shuffledItems.length); i++) {
        switch(currentLevel) {
            case 'consonant':
            case 'vowel':
                wrongAnswers.push(shuffledItems[i].letter);
                break;
            case 'combination':
                wrongAnswers.push(shuffledItems[i].result);
                break;
            case 'word':
                wrongAnswers.push(shuffledItems[i].word);
                break;
        }
    }
    
    // 전체 선택지 (정답 + 오답) 랜덤 배치
    const allChoices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    container.innerHTML = '';
    
    allChoices.forEach(choice => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = 'choice-btn';
        choiceBtn.textContent = choice;
        choiceBtn.onclick = () => selectChoice(choice, correctAnswer);
        container.appendChild(choiceBtn);
    });
}

// 선택 처리 (저장 기능 추가)
function selectChoice(selectedChoice, correctAnswer) {
    if (isAnswered) return;
    
    const responseTime = Date.now() - startTime;
    const isCorrect = selectedChoice === correctAnswer;
    
    // 선택지 비활성화
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.classList.remove('correct', 'incorrect');
    });
    
    // 선택된 버튼에 피드백 적용
    const selectedButton = Array.from(buttons).find(btn => 
        btn.textContent === selectedChoice
    );
    
    if (selectedButton) {
        selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    
    // 데이터 수집
    collectResponseData(selectedChoice, correctAnswer, responseTime, isCorrect);
    
    isAnswered = true;
    
    if (isCorrect) {
        updateTutorMessage('🎉 정답이에요!', 
            `"${selectedChoice}"를 정확히 찾았네요! 정말 잘했어요! 👏`);
        setTimeout(() => {
            markCorrect();
            resetChoices();
        }, 1500);
    } else {
        updateTutorMessage('😊 다시 생각해보세요!', 
            `정답은 "${correctAnswer}"이에요. 소리를 다시 들어보고 기억해보세요! 💡`);
        setTimeout(() => {
            markIncorrect();
            resetChoices();
        }, 2500);
    }
    
    // 저장
    savelearningStats();
}

// 데이터 수집 (저장 기능 추가)
function collectResponseData(selectedAnswer, correctAnswer, responseTime, isCorrect) {
    const currentData = learningData[currentLevel];
    const currentItem = currentData[currentItemIndex];
    
    const responseData = {
        timestamp: new Date(),
        level: currentLevel,
        itemIndex: currentItemIndex,
        currentItem: currentItem,
        selectedAnswer: selectedAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        responseTime: responseTime,
        repeatCount: currentRepeat,
        hint: document.getElementById('hintDescription').textContent
    };
    
    learningStats.responses.push(responseData);
    learningStats.totalQuestions++;
    learningStats.totalTime += responseTime;
    
    if (isCorrect) {
        learningStats.correctAnswers++;
    } else {
        learningStats.incorrectAnswers++;
    }
    
    // 진행상태 업데이트
    updateProgressDisplay();
    
    console.log('학습 데이터:', responseData); // 개발용 로그
}

// 진행상태 표시 업데이트
function updateProgressDisplay() {
    const totalItems = learningData[currentLevel].length;
    const accuracy = learningStats.totalQuestions > 0 ? 
        Math.round((learningStats.correctAnswers / learningStats.totalQuestions) * 100) : 0;
    const avgTime = learningStats.totalQuestions > 0 ? 
        Math.round(learningStats.totalTime / learningStats.totalQuestions / 1000) : 0;
    
    document.getElementById('currentProgress').textContent = 
        `${getLevelKoreanName(currentLevel)} ${currentItemIndex + 1}/${totalItems}`;
    document.getElementById('repeatProgress').textContent = 
        `${currentRepeat}/${repeatSettings.correct}`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    document.getElementById('avgTime').textContent = `${avgTime}초`;
    
    // 프로그레스 바 업데이트
    const overallProgress = ((currentItemIndex + (currentRepeat / repeatSettings.correct)) / totalItems) * 100;
    document.getElementById('progressFill').style.width = `${Math.min(100, overallProgress)}%`;
    document.getElementById('progressCircle').textContent = `${Math.round(overallProgress)}%`;
    
    // 원형 프로그레스 업데이트
    const progressCircle = document.getElementById('progressCircle');
    const progressValue = Math.min(100, overallProgress);
    progressCircle.style.background = 
        `conic-gradient(white ${progressValue}%, rgba(255,255,255,0.3) ${progressValue}%)`;
}

// 레벨 한국어 이름
function getLevelKoreanName(level) {
    const names = {
        consonant: '자음',
        vowel: '모음',
        combination: '글자',
        word: '단어'
    };
    return names[level];
}

// 선택지 리셋
function resetChoices() {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.style.pointerEvents = 'auto';
    });
}

// 현재 소리 재생 (TTS)
function playCurrentSound() {
    const currentData = learningData[currentLevel];
    const currentItem = currentData[currentItemIndex];
    
    let textToSpeak = '';
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            textToSpeak = currentItem.sound;
            break;
        case 'combination':
        case 'word':
            textToSpeak = currentItem.sound;
            break;
    }
    
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.6;
        utterance.pitch = 1.2;
        
        // 버튼 비활성화
        const playButton = document.getElementById('playButton');
        playButton.disabled = true;
        playButton.textContent = '🎵 재생중...';
        
        utterance.onend = () => {
            playButton.disabled = false;
            playButton.textContent = '🎵 소리 듣기';
        };
        
        speechSynthesis.speak(utterance);
        
        updateTutorMessage('🔊 소리 재생', 
            `"${textToSpeak}" 소리를 들어보세요. 어떤 글자인지 맞춰보세요!`);
    }
}

// 타이머 업데이트
function updateTimer() {
    if (startTime && !isAnswered) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timerDisplay').textContent = `${elapsed}초`;
        setTimeout(updateTimer, 1000);
    }
}

// UI 업데이트
function updateUI() {
    updateProgressDisplay();
    document.getElementById('repeatStatus').textContent = `반복: ${currentRepeat}/${repeatSettings.correct}`;
}

// 반복 회수 조정 (저장 기능 추가)
function adjustRepeat(type, delta) {
    const newValue = repeatSettings[type] + delta;
    if (newValue >= 1 && newValue <= 10) {
        repeatSettings[type] = newValue;
        document.getElementById(type + 'Repeat').textContent = newValue;
        
        updateTutorMessage('설정 변경', 
            `${type === 'correct' ? '맞췄을 때' : '틀렸을 때'} 반복 횟수가 ${newValue}회로 설정되었어요! 👍`);
        
        updateUI();
        
        // 설정 저장
        saveSettings();
    }
}

// 정답 처리 (저장 기능 추가)
function markCorrect() {
    if (currentRepeat < repeatSettings.correct) {
        currentRepeat++;
        updateTutorMessage('✨ 계속 진행', 
            `${currentRepeat}번째 반복이에요! 조금 더 연습해봐요! 💪`);
        updateContent();
    } else {
        // 다음 문제로
        showFeedback(true, true);
    }
    updateUI();
    
    // 상태 저장
    saveCurrentState();
}

// 오답 처리 (저장 기능 추가)
function markIncorrect() {
    currentRepeat = 1; // 틀리면 처음부터 다시
    updateTutorMessage('🔄 다시 도전', 
        `괜찮아요! 처음부터 다시 연습해봐요. 소리를 더 주의깊게 들어보세요! 👂`);
    setTimeout(() => {
        updateContent();
    }, 1000);
    updateUI();
    
    // 상태 저장
    saveCurrentState();
}

// 다음 문제 (저장 기능 추가)
function nextQuestion() {
    if (currentRepeat >= repeatSettings.correct) {
        const totalItems = learningData[currentLevel].length;
        
        if (currentItemIndex < totalItems - 1) {
            currentItemIndex++;
            currentRepeat = 1;
            updateContent();
            updateUI();
            
            updateTutorMessage('➡️ 다음 학습', 
                `새로운 문제를 시작해요! 지금까지 잘하고 있어요! 🌟`);
            
            // 상태 저장
            saveCurrentState();
        } else {
            showLevelComplete();
        }
    } else {
        updateTutorMessage('🔄 반복 완료 필요', 
            `현재 문제를 ${repeatSettings.correct}번 맞춰야 다음으로 넘어갈 수 있어요! 💪`);
    }
}

// 레벨 완료 (저장 기능 추가)
function showLevelComplete() {
    const levelNames = {
        consonant: '자음 듣기',
        vowel: '모음 듣기',
        combination: '글자 듣기',
        word: '단어 듣기'
    };
    
    updateTutorMessage('🏆 레벨 완료!', 
        `${levelNames[currentLevel]} 단계를 모두 완료했어요! 정말 대단해요! 🎉`);
    
    // 최종 학습 데이터 출력
    console.log('최종 학습 데이터:', learningStats);
    
    // 완료된 레벨 데이터 저장
    savelearningStats();
    
    showFeedback(true, true);
}

// 피드백 표시
function showFeedback(isCorrect, isComplete) {
    const overlay = document.getElementById('feedbackOverlay');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');
    
    if (isComplete) {
        icon.textContent = '🏆';
        text.textContent = '문제를 완료했어요!';
    } else if (isCorrect) {
        icon.textContent = '✨';
        text.textContent = '잘했어요! 한 번 더!';
    } else {
        icon.textContent = '💪';
        text.textContent = '다시 도전해봐요!';
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

    tutor(message)

    const tutorMessage = document.getElementById('tutorMessage');
    tutorMessage.innerHTML = `<strong>${title}</strong><br><br>${message}`;
}

// 도움말
function getTutorHelp() {
    const helpMessages = {
        consonant: '🎧 자음 듣기: 소리를 잘 들어보고 맞는 자음을 찾아보세요. 힌트의 이미지도 참고하세요!',
        vowel: '🎧 모음 듣기: 모음의 특별한 소리를 들어보세요. 입모양을 생각하면서 들어보세요!',
        combination: '🎧 글자 듣기: 자음과 모음이 합쳐진 소리를 들어보세요. 천천히 발음해보세요!',
        word: '🎧 단어 듣기: 완전한 단어의 소리를 들어보세요. 의미도 함께 생각해보세요!'
    };
    
    updateTutorMessage('💡 도움말', helpMessages[currentLevel]);
}

// 자동 저장 (주기적)
function startAutoSave() {
    setInterval(() => {
        if (currentItemIndex > 0 || currentRepeat > 1 || learningStats.totalQuestions > 0) {
            saveAllData();
        }
    }, 30000); // 30초마다 자동 저장
}

// 페이지 종료 시 저장
function setupBeforeUnloadSave() {
    window.addEventListener('beforeunload', (e) => {
        saveAllData();
    });

    // 페이지 숨김 시에도 저장 (모바일 지원)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveAllData();
        }
    });
}

// 초기화
document.addEventListener('DOMContentLoaded',  async () => {
    // 진행상태 토글 기본 열기
    document.getElementById('progressContent').classList.add('active');
    document.getElementById('progressArrow').classList.add('rotated');
    document.getElementById('progressArrow').textContent = '▲';
    
    // 저장된 데이터 확인
    const savedData = loadSavedState();
    
    if (savedData && savedData.isValid) {
        // 저장된 데이터가 있으면 복원 모달 표시
        showRestoreModal(savedData);
    } else {
        // 저장된 데이터가 없으면 새로 시작
        selectLevel('consonant');
        
        setTimeout(() => {
            updateTutorMessage('👋 듣기 학습 시작!', 
                '소리를 통해 한글을 배우는 특별한 시간이에요! 🎧 소리 듣기 버튼을 눌러서 시작해보세요! ✨');
        }, 1000);
    }
    
    // 자동 저장 시작
    startAutoSave();
    
    // 페이지 종료 시 저장 설정
    setupBeforeUnloadSave();

    await initCamera();
    handleStart()
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        playCurrentSound();
    } else if (e.code === 'Enter') {
        e.preventDefault();
        nextQuestion();
    } else if (e.code === 'KeyH') {
        e.preventDefault();
        getTutorHelp();
    } else if (e.code === 'KeyS' && e.ctrlKey) {
        e.preventDefault();
        saveAllData();
        updateTutorMessage('💾 수동 저장', '진행상황이 저장되었어요! 👍');
    }
});

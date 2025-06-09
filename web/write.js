const levelMap = {
    'consonant': 0,
    'vowel': 1,
    'combination': 2,
    'word': 3
};

// 메모리 기반 저장소 시뮬레이션
let memoryStorage = {
    data: {},
    setItem: function(key, value) {
        this.data[key] = value;
    },
    getItem: function(key) {
        return this.data[key] || null;
    },
    removeItem: function(key) {
        delete this.data[key];
    },
    clear: function() {
        this.data = {};
    }
};

// 전역 상태 관리
let currentLevel = 'consonant';
let currentItemIndex = 0;
let currentRepeat = 1;
let startTime = null;
let guideVisible = false;
let isDrawing = false;

// 반복 설정
let repeatSettings = {
    correct: 3,
    incorrect: 5
};

// 학습 데이터 수집
let learningStats = {
    totalProblems: 0,
    correctProblems: 0,
    responseTimes: [],
    problemLog: []
};


// 캔버스 초기화
let canvas, ctx;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('writingCanvas');
    ctx = canvas.getContext('2d');
    
    // 캔버스 설정
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 터치 및 마우스 이벤트 등록
    setupCanvasEvents();
    
    // 저장된 진행상황 확인 및 로드
    checkSavedProgress();
    
    // 초기 데이터 로드
    selectLevel('consonant');
    updateLearningData();
    
    setTimeout(() => {
        updateTutorMessage('👋 환영해요!', 
            '한글 쓰기 연습을 시작해봐요! 저장 기능으로 언제든지 이어서 할 수 있어요! ✏️✨');
    }, 1000);
});

// 저장된 진행상황 확인
function checkSavedProgress() {
    const savedData = memoryStorage.getItem('hangulWritingProgress');
    if (savedData) {
        const saveTime = memoryStorage.getItem('hangulWritingSaveTime');
        document.getElementById('saveStatus').textContent = 
            `저장된 진행상황 있음 (${new Date(parseInt(saveTime)).toLocaleString()})`;
        
        updateTutorMessage('💾 저장된 진행상황 발견!', 
            '이전에 저장된 학습 진행상황이 있어요. "불러오기" 버튼을 눌러서 이어서 학습할 수 있어요! 📚');
    } else {
        document.getElementById('saveStatus').textContent = '저장된 진행상황이 없습니다';
    }
}

// 진행상황 저장
function saveProgress() {
    const progressData = {
        currentLevel: currentLevel,
        currentItemIndex: currentItemIndex,
        currentRepeat: currentRepeat,
        repeatSettings: {...repeatSettings},
        learningStats: {
            ...learningStats,
            problemLog: [...learningStats.problemLog],
            responseTimes: [...learningStats.responseTimes]
        }
    };
    
    const saveTime = Date.now().toString();
    
    memoryStorage.setItem('hangulWritingProgress', JSON.stringify(progressData));
    memoryStorage.setItem('hangulWritingSaveTime', saveTime);
    
    const saveDate = new Date(parseInt(saveTime));
    document.getElementById('saveStatus').textContent = 
        `저장 완료! (${saveDate.toLocaleString()})`;
    
    updateTutorMessage('💾 저장 완료!', 
        `현재 학습 진행상황이 저장되었어요! 언제든지 "불러오기"를 통해 이어서 학습할 수 있어요! 🎉`);
    
    // 저장 완료 피드백
    showSaveFeedback('저장되었습니다!', '💾');
}

// 진행상황 불러오기
function loadProgress() {
    const savedData = memoryStorage.getItem('hangulWritingProgress');
    
    if (!savedData) {
        updateTutorMessage('❌ 불러오기 실패', 
            '저장된 진행상황이 없어요. 먼저 학습을 진행하고 저장해보세요! 📚');
        return;
    }
    
    try {
        const progressData = JSON.parse(savedData);
        
        // 상태 복원
        currentLevel = progressData.currentLevel;
        currentItemIndex = progressData.currentItemIndex;
        currentRepeat = progressData.currentRepeat;
        repeatSettings = {...progressData.repeatSettings};
        learningStats = {
            ...progressData.learningStats,
            problemLog: [...progressData.learningStats.problemLog],
            responseTimes: [...progressData.learningStats.responseTimes]
        };
        
        // UI 업데이트
        updateRepeatSettingsUI();
        updateLevelButtonsUI();
        updateContent();
        updateLevelMessage();
        generateRandomChoices();
        updateLearningData();
        clearCanvas();
        
        const saveTime = memoryStorage.getItem('hangulWritingSaveTime');
        const saveDate = new Date(parseInt(saveTime));
        
        updateTutorMessage('✅ 불러오기 완료!', 
            `${saveDate.toLocaleString()}에 저장된 진행상황을 불러왔어요! 이어서 학습해보세요! 🚀`);
        
        // 불러오기 완료 피드백
        showSaveFeedback('불러오기 완료!', '📂');
        
    } catch (error) {
        updateTutorMessage('❌ 불러오기 오류', 
            '저장된 데이터를 읽는 중 오류가 발생했어요. 다시 시도해보세요! 🔄');
    }
}

// 진행상황 초기화
function resetProgress() {
    if (confirm('모든 학습 진행상황과 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
        // 메모리 저장소 초기화
        memoryStorage.clear();
        
        // 상태 초기화
        currentLevel = 'consonant';
        currentItemIndex = 0;
        currentRepeat = 1;
        repeatSettings = {
            correct: 3,
            incorrect: 5
        };
        learningStats = {
            totalProblems: 0,
            correctProblems: 0,
            responseTimes: [],
            problemLog: []
        };
        
        // UI 초기화
        updateRepeatSettingsUI();
        updateLevelButtonsUI();
        selectLevel('consonant');
        updateLearningData();
        clearCanvas();
        
        document.getElementById('saveStatus').textContent = '저장된 진행상황이 없습니다';
        
        updateTutorMessage('🔄 초기화 완료!', 
            '모든 학습 데이터가 초기화되었어요! 처음부터 다시 시작해보세요! ✨');
        
        // 초기화 완료 피드백
        showSaveFeedback('초기화 완료!', '🔄');
    }
}

// 반복 설정 UI 업데이트
function updateRepeatSettingsUI() {
    document.getElementById('correctRepeat').textContent = repeatSettings.correct;
    document.getElementById('incorrectRepeat').textContent = repeatSettings.incorrect;
}

// 레벨 버튼 UI 업데이트
function updateLevelButtonsUI() {
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    
    const buttons = document.querySelectorAll('.level-btn');
    if (buttons[levelMap[currentLevel]]) {
        buttons[levelMap[currentLevel]].classList.add('active');
    }
}

// 저장/불러오기 피드백 표시
function showSaveFeedback(message, icon) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 3000;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        border: 3px solid #3b82f6;
    `;
    
    feedbackDiv.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 10px;">${icon}</div>
        <div>${message}</div>
    `;
    
    document.body.appendChild(feedbackDiv);
    
    setTimeout(() => {
        document.body.removeChild(feedbackDiv);
    }, 2000);
}

// 캔버스 이벤트 설정
function setupCanvasEvents() {
    // 마우스 이벤트
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 터치 이벤트
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

// 그리기 시작
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// 그리기
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
}

// 그리기 중지
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

// 터치 이벤트 처리
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                    e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// 캔버스 지우기
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 가이드 토글
function toggleGuide() {
    guideVisible = !guideVisible;
    const guideOverlay = document.getElementById('guideOverlay');
    guideOverlay.style.display = guideVisible ? 'flex' : 'none';
    
    if (guideVisible) {
        const currentData = learningData[currentLevel][currentItemIndex];
        if (currentLevel === 'combination') {
            guideOverlay.textContent = currentData.result;
        } else if (currentLevel === 'word') {
            guideOverlay.textContent = currentData.word;
        } else {
            guideOverlay.textContent = currentData.letter;
        }
    }
}

// 토글 섹션 제어
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(sectionId.replace('Section', 'Arrow'));
    
    if (section.classList.contains('show')) {
        section.classList.remove('show');
        arrow.classList.remove('rotate');
    } else {
        section.classList.add('show');
        arrow.classList.add('rotate');
    }
}

// 레벨 선택
function selectLevel(level) {
    // 레벨 버튼 상태 업데이트
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.level-btn')[levelMap[currentLevel]].classList.add('active');
    //document.getElementById('.level-btn[data-level=${level}]').classList.add('active');

    // 이벤트가 있는 경우에만 active 클래스 추가
    /*
    if (event && event.target) {
        document.querySelector(`.level-btn[data-level=${level}]`).classList.add('active');
    } else {
        // 프로그래매틱 호출인 경우 레벨에 맞는 버튼 찾아서 활성화
        updateLevelButtonsUI();
    }
        */

    currentLevel = level;
    currentItemIndex = 0;
    currentRepeat = 1;
    
    updateContent();
    updateLevelMessage();
    generateRandomChoices();
    clearCanvas();
}

// 레벨별 메시지 업데이트
function updateLevelMessage() {
    const currentData = learningData[currentLevel][currentItemIndex];
    const messages = {
        consonant: {
            title: '자음 쓰기 연습',
            subtitle: `기초 자음 '${currentData.letter}' 쓰기 연습`,
            message: `자음 '${currentData.letter}'을 캔버스에 써보고 문제도 풀어보세요! ${currentData.example} 📚`
        },
        vowel: {
            title: '모음 쓰기 연습', 
            subtitle: `기초 모음 '${currentData.letter}' 쓰기 연습`,
            message: `모음 '${currentData.letter}'을 캔버스에 써보고 문제도 풀어보세요! ${currentData.example} 🎵`
        },
        combination: {
            title: '글자 쓰기 연습',
            subtitle: `'${currentData.result}' 글자 쓰기 연습`,
            message: `'${currentData.result}' 글자를 캔버스에 써보고 문제도 풀어보세요! ${currentData.meaning} ✨`
        },
        word: {
            title: '단어 쓰기 연습',
            subtitle: `'${currentData.word}' 단어 쓰기 연습`,
            message: `'${currentData.word}' 단어를 캔버스에 써보고 문제도 풀어보세요! ${currentData.meaning} 🏆`
        }
    };
    
    const levelInfo = messages[currentLevel];
    document.getElementById('lessonTitle').textContent = levelInfo.title;
    document.getElementById('lessonSubtitle').textContent = levelInfo.subtitle;
    updateTutorMessage(levelInfo.title, levelInfo.message);
}

// 콘텐츠 업데이트
function updateContent() {
    const currentData = learningData[currentLevel][currentItemIndex];
    
    // 타겟 글자 업데이트
    let targetText, hintText;
    
    switch(currentLevel) {
        case 'consonant':
        case 'vowel':
            targetText = currentData.letter;
            hintText = currentData.example;
            break;
        case 'combination':
            targetText = currentData.result;
            hintText = currentData.meaning;
            break;
        case 'word':
            targetText = currentData.word;
            hintText = currentData.meaning;
            break;
    }
    
    document.getElementById('targetLetter').textContent = targetText;
    document.getElementById('targetChoice').textContent = targetText;
    document.getElementById('hintText').textContent = hintText;
    document.getElementById('hintImage').textContent = currentData.image;
    
    // 가이드 오버레이 업데이트
    if (guideVisible) {
        document.getElementById('guideOverlay').textContent = targetText;
    }
    
    updateProgressBar();
    updateRepeatStatus();
}

// 랜덤 선택지 생성
function generateRandomChoices() {
    const container = document.getElementById('practiceChoices');
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
    
    // 오답 선택지 생성 (3개)
    let wrongAnswers = [];
    const allItems = [...currentData];
    allItems.splice(currentItemIndex, 1); // 현재 항목 제거
    
    // 랜덤하게 3개 선택
    const shuffled = allItems.sort(() => Math.random() - 0.5);
    wrongAnswers = shuffled.slice(0, 3).map(item => {
        switch(currentLevel) {
            case 'consonant':
            case 'vowel':
                return item.letter;
            case 'combination':
                return item.result;
            case 'word':
                return item.word;
            default:
                return item.letter;
        }
    });
    
    // 전체 선택지 (정답 + 오답 3개) 랜덤 배치
    const allChoices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    container.innerHTML = '';
    
    allChoices.forEach(choice => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = 'choice-btn';
        choiceBtn.textContent = choice;
        choiceBtn.onclick = () => selectChoice(choice, correctAnswer);
        container.appendChild(choiceBtn);
    });
    
    // 문제 시작 시간 기록
    startTime = Date.now();
}

// 선택 처리
function selectChoice(selectedChoice, correctAnswer) {
    const isCorrect = selectedChoice === correctAnswer;
    const responseTime = Date.now() - startTime;
    const buttons = document.querySelectorAll('.choice-btn');
    
    // 모든 버튼 비활성화
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
    
    // 학습 데이터 기록
    learningStats.totalProblems++;
    if (isCorrect) {
        learningStats.correctProblems++;
    }
    learningStats.responseTimes.push(responseTime);
    learningStats.problemLog.push({
        level: currentLevel,
        item: currentItemIndex,
        question: correctAnswer,
        answer: selectedChoice,
        isCorrect: isCorrect,
        responseTime: responseTime,
        timestamp: new Date().toISOString()
    });
    
    updateLearningData();
    
    if (isCorrect) {
        updateTutorMessage('🎉 정답이에요!', 
            `"${selectedChoice}"를 정확히 찾았네요! 정말 잘했어요! 👏`);
        setTimeout(() => {
            markActivity(true);
            resetChoices();
        }, 1500);
    } else {
        updateTutorMessage('😊 다시 생각해보세요!', 
            `조금 다른 것 같아요. 정답은 "${correctAnswer}"이에요! 💡`);
        setTimeout(() => {
            resetChoices();
        }, 2000);
    }
}

// 선택지 리셋
function resetChoices() {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.style.pointerEvents = 'auto';
    });
    
    // 새로운 랜덤 선택지 생성
    generateRandomChoices();
}

// 진행률 업데이트
function updateProgressBar() {
    const totalItems = learningData[currentLevel].length;
    const progress = ((currentItemIndex + (currentRepeat - 1) / repeatSettings.correct) / totalItems) * 100;
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
}

// 반복 상태 업데이트
function updateRepeatStatus() {
    const maxRepeat = repeatSettings.correct;
    document.getElementById('repeatStatus').textContent = `반복: ${currentRepeat}/${maxRepeat}`;
}

// 학습 데이터 업데이트
function updateLearningData() {
    const accuracyRate = learningStats.totalProblems > 0 ? 
        Math.round((learningStats.correctProblems / learningStats.totalProblems) * 100) : 0;
    
    const avgTime = learningStats.responseTimes.length > 0 ?
        Math.round(learningStats.responseTimes.reduce((a, b) => a + b, 0) / learningStats.responseTimes.length / 1000) : 0;
    
    document.getElementById('accuracyRate').textContent = accuracyRate + '%';
    document.getElementById('totalProblems').textContent = learningStats.totalProblems;
    document.getElementById('correctProblems').textContent = learningStats.correctProblems;
    document.getElementById('avgTime').textContent = avgTime + '초';
}

// 반복 회수 조정
function adjustRepeat(type, delta) {
    const newValue = repeatSettings[type] + delta;
    if (newValue >= 1 && newValue <= 10) {
        repeatSettings[type] = newValue;
        document.getElementById(type + 'Repeat').textContent = newValue;
        
        updateTutorMessage('설정 변경', 
            `${type === 'correct' ? '맞췄을 때' : '틀렸을 때'} 반복 횟수가 ${newValue}회로 설정되었어요! 👍`);
        
        updateProgressBar();
        updateRepeatStatus();
    }
}

// 활동 평가
function markActivity(isCorrect) {
    if (isCorrect) {
        if (currentRepeat < repeatSettings.correct) {
            currentRepeat++;
            updateRepeatStatus();
            updateProgressBar();
            showFeedback(true, false);
        } else {
            showFeedback(true, true);
            setTimeout(() => nextItem(), 2000);
        }
    } else {
        currentRepeat = Math.min(currentRepeat + 1, repeatSettings.incorrect);
        updateRepeatStatus();
        showFeedback(false, false);
    }
}

// 다음 항목
function nextItem() {
    const maxIndex = learningData[currentLevel].length - 1;
    
    if (currentItemIndex < maxIndex) {
        currentItemIndex++;
        currentRepeat = 1;
        updateContent();
        updateLevelMessage();
        generateRandomChoices();
        clearCanvas();
    } else {
        showLevelComplete();
    }
}

// 레벨 완료 표시
function showLevelComplete() {
    const levelNames = {
        consonant: '자음 쓰기',
        vowel: '모음 쓰기',
        combination: '글자 쓰기',
        word: '단어 쓰기'
    };
    
    updateTutorMessage('🏆 레벨 완료!', 
        `${levelNames[currentLevel]} 단계를 모두 완료했어요! 정말 대단해요! 다른 단계도 도전해보세요! 🎉`);
}

// 피드백 표시
function showFeedback(isCorrect, isComplete) {
    const overlay = document.getElementById('feedbackOverlay');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');
    
    if (isCorrect) {
        if (isComplete) {
            icon.textContent = '🏆';
            text.textContent = '이 글자를 완벽하게 배웠어요!';
        } else {
            icon.textContent = '✨';
            text.textContent = '잘했어요! 한 번 더 해봐요!';
        }
    } else {
        icon.textContent = '💪';
        text.textContent = '괜찮아요! 다시 도전해봐요!';
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
        consonant: '자음을 캔버스에 직접 써보세요! 가이드 버튼을 누르면 연한 글자가 나타나요. 그 위에 따라 써보세요!',
        vowel: '모음을 캔버스에 직접 써보세요! 획순을 생각하면서 천천히 써보세요!',
        combination: '자음과 모음이 합쳐진 글자를 써보세요! 어떻게 조합되는지 잘 보세요!',
        word: '완전한 단어를 써보세요! 각 글자의 간격도 생각하면서 써보세요!'
    };
    
    updateTutorMessage('💡 도움말', helpMessages[currentLevel]);
}

// 자동 저장 기능 (선택적)
function autoSave() {
    // 중요한 이벤트 후에 자동으로 저장
    const progressData = {
        currentLevel: currentLevel,
        currentItemIndex: currentItemIndex,
        currentRepeat: currentRepeat,
        repeatSettings: {...repeatSettings},
        learningStats: {
            ...learningStats,
            problemLog: [...learningStats.problemLog],
            responseTimes: [...learningStats.responseTimes]
        }
    };
    
    memoryStorage.setItem('hangulWritingAutoSave', JSON.stringify(progressData));
    memoryStorage.setItem('hangulWritingAutoSaveTime', Date.now().toString());
}

// 자동 저장된 데이터 복원 (페이지 로드 시)
function restoreAutoSave() {
    const autoSavedData = memoryStorage.getItem('hangulWritingAutoSave');
    if (autoSavedData) {
        try {
            const progressData = JSON.parse(autoSavedData);
            
            // 자동 저장된 데이터가 최근 것인지 확인 (예: 1시간 이내)
            const autoSaveTime = parseInt(memoryStorage.getItem('hangulWritingAutoSaveTime') || '0');
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            
            if (now - autoSaveTime < oneHour) {
                // 자동 저장된 데이터로 복원
                currentLevel = progressData.currentLevel;
                currentItemIndex = progressData.currentItemIndex;
                currentRepeat = progressData.currentRepeat;
                repeatSettings = {...progressData.repeatSettings};
                learningStats = {
                    ...progressData.learningStats,
                    problemLog: [...progressData.learningStats.problemLog],
                    responseTimes: [...progressData.learningStats.responseTimes]
                };
                
                updateRepeatSettingsUI();
                updateLevelButtonsUI();
                updateLearningData();
                
                return true; // 자동 복원됨
            }
        } catch (error) {
            console.log('자동 저장 데이터 복원 중 오류:', error);
        }
    }
    return false; // 자동 복원 안됨
}

// 학습 진행 시마다 자동 저장 트리거
function triggerAutoSave() {
    // 문제를 맞췄거나, 다음 단계로 넘어갈 때 자동 저장
    setTimeout(() => autoSave(), 500);
}

// 콘솔에 학습 데이터 출력 (개발자용)
function exportLearningData() {
    console.log('=== 학습 데이터 ===');
    console.log('총 문제 수:', learningStats.totalProblems);
    console.log('정답 수:', learningStats.correctProblems);
    console.log('정답률:', Math.round((learningStats.correctProblems / learningStats.totalProblems) * 100) + '%');
    console.log('평균 응답 시간:', Math.round(learningStats.responseTimes.reduce((a, b) => a + b, 0) / learningStats.responseTimes.length) + 'ms');
    console.log('세부 로그:', learningStats.problemLog);
    console.log('현재 진행상황:', {
        level: currentLevel,
        itemIndex: currentItemIndex,
        repeat: currentRepeat
    });
    return {
        stats: learningStats,
        progress: {
            level: currentLevel,
            itemIndex: currentItemIndex,
            repeat: currentRepeat,
            settings: repeatSettings
        }
    };
}

// 학습 통계 요약
function getLearningSummary() {
    const summary = {
        totalTime: 0,
        levelProgress: {},
        strengths: [],
        improvements: []
    };
    
    // 레벨별 진행도 계산
    Object.keys(learningData).forEach(level => {
        const levelProblems = learningStats.problemLog.filter(log => log.level === level);
        const levelCorrect = levelProblems.filter(log => log.isCorrect).length;
        const levelTotal = levelProblems.length;
        
        summary.levelProgress[level] = {
            correct: levelCorrect,
            total: levelTotal,
            accuracy: levelTotal > 0 ? Math.round((levelCorrect / levelTotal) * 100) : 0
        };
    });
    
    // 강점과 개선점 분석
    Object.entries(summary.levelProgress).forEach(([level, data]) => {
        if (data.accuracy >= 80) {
            summary.strengths.push(level);
        } else if (data.total > 0) {
            summary.improvements.push(level);
        }
    });
    
    return summary;
}

// DOMContentLoaded 이벤트 수정 (자동 복원 포함)
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('writingCanvas');
    ctx = canvas.getContext('2d');
    
    // 캔버스 설정
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 터치 및 마우스 이벤트 등록
    setupCanvasEvents();
    
    // 자동 저장된 데이터 복원 시도
    const autoRestored = restoreAutoSave();
    
    // 저장된 진행상황 확인 및 로드
    checkSavedProgress();
    
    // 초기 데이터 로드 (자동 복원되지 않은 경우에만)
    if (!autoRestored) {
        selectLevel('consonant');
    } else {

        // 자동 복원된 경우 현재 상태로 UI 업데이트
        updateContent();
        updateLevelMessage();
        generateRandomChoices();
    }
    
    updateLearningData();
    
    setTimeout(() => {
        if (autoRestored) {
            updateTutorMessage('🔄 자동 복원됨!', 
                '이전 학습 세션이 자동으로 복원되었어요! 이어서 학습해보세요! 📚✨');
        } else {
            updateTutorMessage('👋 환영해요!', 
                '한글 쓰기 연습을 시작해봐요! 저장 기능으로 언제든지 이어서 할 수 있어요! ✏️✨');
        }
    }, 1000);
});

// 기존 함수들 수정 - 자동 저장 트리거 추가

// selectChoice 함수에 자동 저장 추가
const originalSelectChoice = selectChoice;
selectChoice = function(selectedChoice, correctAnswer) {
    const result = originalSelectChoice.call(this, selectedChoice, correctAnswer);
    triggerAutoSave(); // 문제 풀이 후 자동 저장
    return result;
};

// nextItem 함수에 자동 저장 추가
const originalNextItem = nextItem;
nextItem = function() {
    const result = originalNextItem.call(this);
    triggerAutoSave(); // 다음 문제로 이동 시 자동 저장
    return result;
};

// markActivity 함수에 자동 저장 추가
const originalMarkActivity = markActivity;
markActivity = function(isCorrect) {
    const result = originalMarkActivity.call(this, isCorrect);
    triggerAutoSave(); // 활동 평가 후 자동 저장
    return result;
};

// 전역에서 데이터 접근 가능하도록
window.exportLearningData = exportLearningData;
window.getLearningSummary = getLearningSummary;
window.saveProgress = saveProgress;
window.loadProgress = loadProgress;
window.resetProgress = resetProgress;

// 페이지 언로드 시 자동 저장
window.addEventListener('beforeunload', () => {
    autoSave();
});

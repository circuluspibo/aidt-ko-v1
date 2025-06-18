
const STORAGE_KEYS = {
    LEARNING_STATE: 'hangul_learning_state',
    LEARNING_STATS: 'hangul_learning_stats',
    SETTINGS: 'hangul_learning_settings'
};

// 전역 상태 관리
let currentLevel = 'consonant';
let currentItemIndex = 0;
let currentRepeat = 1;
let startTime = Date.now();
let questionStartTime = Date.now();
let timerInterval;

// 반복 설정
let repeatSettings = {
    correct: 3,
    incorrect: 5
};

// 데이터 분석용 통계
let learningStats = {
    totalQuestions: 0,
    correctAnswers: 0,
    totalResponseTime: 0,
    responses: [], // 각 응답 세부 정보
    sessionStartTime: Date.now()
};

// 현재 학습 상태 저장
function saveLearningState() {
    const state = {
        currentLevel,
        currentItemIndex,
        currentRepeat,
        lastSaveTime: new Date().toLocaleString('ko-KR')
    };
    
    try {
        localStorage.setItem(STORAGE_KEYS.LEARNING_STATE, JSON.stringify(state));
        updateSaveIndicator('💾 저장완료');
        updateLastSaveTime();
    } catch (error) {
        console.error('저장 실패:', error);
        updateSaveIndicator('❌ 저장실패');
    }
}

// 학습 상태 로드
function loadLearningState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEYS.LEARNING_STATE);
        if (savedState) {
            const state = JSON.parse(savedState);
            
            currentLevel = state.currentLevel || 'consonant';
            currentItemIndex = state.currentItemIndex || 0;
            currentRepeat = state.currentRepeat || 1;
            
            // 유효성 검사
            if (currentItemIndex >= learningData[currentLevel].length) {
                currentItemIndex = 0;
            }
            
            updateTutorMessage('📂 이어서 학습', 
                `이전에 학습하던 내용을 불러왔어요! ${getCurrentLevelName()} ${currentItemIndex + 1}번째 항목부터 계속해봐요! 🎯`);
            
            updateLastSaveTime();
            return true;
        }
    } catch (error) {
        console.error('로드 실패:', error);
    }
    return false;
}

// 설정 저장
function saveSettings() {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(repeatSettings));
    } catch (error) {
        console.error('설정 저장 실패:', error);
    }
}

// 설정 로드
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            repeatSettings = { ...repeatSettings, ...settings };
            
            document.getElementById('correctRepeat').textContent = repeatSettings.correct;
            document.getElementById('incorrectRepeat').textContent = repeatSettings.incorrect;
        }
    } catch (error) {
        console.error('설정 로드 실패:', error);
    }
}

// 통계 저장
function saveLearningStats() {
    try {
        localStorage.setItem(STORAGE_KEYS.LEARNING_STATS, JSON.stringify(learningStats));
    } catch (error) {
        console.error('통계 저장 실패:', error);
    }
}

// 통계 로드
function loadLearningStats() {
    try {
        const savedStats = localStorage.getItem(STORAGE_KEYS.LEARNING_STATS);
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            learningStats = { ...learningStats, ...stats };
            
            // 세션 시작 시간은 현재 시간으로 업데이트
            learningStats.sessionStartTime = Date.now();
            
            updateStatsDisplay();
        }
    } catch (error) {
        console.error('통계 로드 실패:', error);
    }
}

// 모든 데이터 초기화
function resetAllData() {
    if (confirm('모든 학습 데이터와 통계를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        try {
            localStorage.removeItem(STORAGE_KEYS.LEARNING_STATE);
            localStorage.removeItem(STORAGE_KEYS.LEARNING_STATS);
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            
            // 상태 초기화
            currentLevel = 'consonant';
            currentItemIndex = 0;
            currentRepeat = 1;
            
            repeatSettings = {
                correct: 3,
                incorrect: 5
            };
            
            learningStats = {
                totalQuestions: 0,
                correctAnswers: 0,
                totalResponseTime: 0,
                responses: [],
                sessionStartTime: Date.now()
            };
            
            // UI 업데이트
            updateStatsDisplay();
            document.getElementById('correctRepeat').textContent = repeatSettings.correct;
            document.getElementById('incorrectRepeat').textContent = repeatSettings.incorrect;
            document.getElementById('lastSaveTime').textContent = '-';
            
            // 첫 번째 레벨로 돌아가기
            selectLevel('consonant');
            
            updateTutorMessage('🗑️ 초기화 완료', 
                '모든 데이터가 삭제되었어요! 새로운 마음으로 한글 학습을 시작해봐요! 🌟');
                
            updateSaveIndicator('🆕 새로시작');
        } catch (error) {
            console.error('초기화 실패:', error);
            alert('초기화 중 오류가 발생했습니다.');
        }
    }
}

// 현재 레벨 이름 가져오기
function getCurrentLevelName() {
    const levelNames = {
        consonant: '자음 보기',
        vowel: '모음 보기',
        combination: '글자 보기',
        word: '단어 보기'
    };
    return levelNames[currentLevel];
}

// 저장 표시기 업데이트
function updateSaveIndicator(text) {
    const indicator = document.getElementById('saveIndicator');
    indicator.textContent = text;
    
    // 2초 후 기본 상태로 복원
    setTimeout(() => {
        indicator.textContent = '💾 자동저장됨';
    }, 2000);
}

// 마지막 저장 시간 업데이트
function updateLastSaveTime() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEYS.LEARNING_STATE);
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.lastSaveTime) {
                //document.getElementById('lastSaveTime').textContent = state.lastSaveTime;
            }
        }
    } catch (error) {
        console.error('저장 시간 로드 실패:', error);
    }
}

// ========== 기존 기능들 ==========

// 토글 기능
function toggleSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const arrow = document.getElementById(sectionName + 'Arrow');
    
    content.classList.toggle('active');
    arrow.classList.toggle('active');
}

// 레벨 선택
function selectLevel(level) {
    // 레벨 버튼 상태 업데이트
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
    
    // 현재 클릭된 버튼을 찾아서 활성화
    const levelMap = {
        consonant: 0,
        vowel: 1,
        combination: 2,
        word: 3
    };
    document.querySelectorAll('.level-btn')[levelMap[level]].classList.add('active');
    
    currentLevel = level;
    currentItemIndex = 0;
    currentRepeat = 1;
    
    // 모든 영역 숨기기
    document.querySelectorAll('#consonantArea, #vowelArea, #combinationArea, #wordArea').forEach(area => {
        area.style.display = 'none';
    });
    
    // 선택된 레벨 영역 표시
    const areaMap = {
        consonant: 'consonantArea',
        vowel: 'vowelArea', 
        combination: 'combinationArea',
        word: 'wordArea'
    };
    
    document.getElementById(areaMap[level]).style.display = 'block';
    
    updateContent();
    updateLevelMessage();
    startTimer();
    saveLearningState(); // 레벨 변경 시 저장
}

// 타이머 시작
function startTimer() {
    questionStartTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);
}

// 타이머 업데이트
function updateTimer() {
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    document.getElementById('timerDisplay').textContent = elapsed + '초';
}

// 반복 회수 조정
function adjustRepeat(type, delta) {
    const newValue = repeatSettings[type] + delta;
    if (newValue >= 1 && newValue <= 10) {
        repeatSettings[type] = newValue;
        document.getElementById(type + 'Repeat').textContent = newValue;
        updateTutorMessage('설정 변경', 
            `${type === 'correct' ? '맞췄을 때' : '틀렸을 때'} 반복 횟수가 ${newValue}회로 설정되었어요! 👍`);
        saveSettings(); // 설정 변경 시 저장
    }
}

// 콘텐츠 업데이트
function updateContent() {
    const item = learningData[currentLevel][currentItemIndex];
    
    switch(currentLevel) {
        case 'consonant':
            updateConsonantContent(item);
            break;
        case 'vowel':
            updateVowelContent(item);
            break;
        case 'combination':
            updateCombinationContent(item);
            break;
        case 'word':
            updateWordContent(item);
            break;
    }
    
    updateProgressDisplay();
    generateRandomChoices();
}

// 자음 콘텐츠 업데이트
function updateConsonantContent(item) {
    document.getElementById('currentLetter').textContent = item.letter;
    document.getElementById('letterName').textContent = item.name;
    document.getElementById('letterSound').textContent = item.sound;
    document.getElementById('letterExample').textContent = item.example;
    document.getElementById('targetLetter').textContent = item.letter;
    document.getElementById('hintImage').textContent = item.image;
}

// 모음 콘텐츠 업데이트
function updateVowelContent(item) {
    document.getElementById('currentVowel').textContent = item.letter;
    document.getElementById('vowelName').textContent = item.name;
    document.getElementById('vowelSound').textContent = item.sound;
    document.getElementById('vowelExample').textContent = item.example;
    document.getElementById('targetVowel').textContent = item.letter;
    document.getElementById('vowelHintImage').textContent = item.image;
}

// 조합 콘텐츠 업데이트
function updateCombinationContent(item) {
    document.getElementById('combConsonant').textContent = item.consonant;
    document.getElementById('combVowel').textContent = item.vowel;
    document.getElementById('combResult').textContent = item.result;
    document.getElementById('targetCombination').textContent = item.result;
}

// 단어 콘텐츠 업데이트
function updateWordContent(item) {
    document.getElementById('syllable1').textContent = item.syllables[0];
    document.getElementById('syllable2').textContent = item.syllables[1] || '';
    document.getElementById('wordImage').textContent = item.image;
    document.getElementById('targetWord').textContent = item.word;
    
    // 세 번째 음절 처리
    if (item.syllables[2]) {
        // 세 번째 음절이 있으면 새로 생성
        let syllable3 = document.getElementById('syllable3');
        if (!syllable3) {
            syllable3 = document.createElement('div');
            syllable3.className = 'syllable';
            syllable3.id = 'syllable3';
            document.querySelector('.word-breakdown').appendChild(syllable3);
        }
        syllable3.textContent = item.syllables[2];
        syllable3.style.display = 'flex';
    } else {
        // 세 번째 음절이 없으면 숨기기
        const syllable3 = document.getElementById('syllable3');
        if (syllable3) syllable3.style.display = 'none';
    }
    
    // 두 번째 음절 처리
    if (!item.syllables[1]) {
        document.getElementById('syllable2').style.display = 'none';
    } else {
        document.getElementById('syllable2').style.display = 'flex';
    }
}

// 진행 상태 업데이트
function updateProgressDisplay() {
    const total = learningData[currentLevel].length;
    document.getElementById('currentProgress').textContent = `${currentItemIndex + 1}/${total}`;
    document.getElementById('progressCircle').textContent = `${currentItemIndex + 1}/${total}`;
    document.getElementById('repeatStatus').textContent = `반복: ${currentRepeat}/${repeatSettings.correct}`;
}

// 레벨별 메시지 업데이트
function updateLevelMessage() {
    const item = learningData[currentLevel][currentItemIndex];
    const messages = {
        consonant: {
            title: '자음 보기 학습',
            subtitle: `기초 자음 '${item.letter}' 보기 학습하기`,
            message: `한글의 기본이 되는 자음을 배워봐요! '${item.letter}' 글자를 천천히 보고 특징을 기억하세요! 📚`
        },
        vowel: {
            title: '모음 보기 학습',
            subtitle: `기초 모음 '${item.letter}' 보기 학습하기`,
            message: `이제 모음을 배워볼 시간이에요! '${item.letter}' 글자의 모양을 잘 관찰해보세요! 🎵`
        },
        combination: {
            title: '글자 보기 학습',
            subtitle: `'${item.result}' 글자 보기 학습하기`,
            message: `자음과 모음이 어떻게 합쳐지는지 보세요! ${item.consonant} + ${item.vowel} = ${item.result} ✨`
        },
        word: {
            title: '단어 보기 학습',
            subtitle: `'${item.word}' 단어 보기 학습하기`,
            message: `완전한 단어를 배워봐요! '${item.word}'의 모양과 의미를 함께 기억하세요! 🏆`
        }
    };
    
    const levelInfo = messages[currentLevel];
    document.getElementById('lessonTitle').textContent = levelInfo.title;
    document.getElementById('lessonSubtitle').textContent = levelInfo.subtitle;
    updateTutorMessage(levelInfo.title, levelInfo.message);
}

// 랜덤 선택지 생성
function generateRandomChoices() {
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
    
    // 오답 선택지 생성 (4개)
    let wrongAnswers = [];
    if (currentLevel === 'word') {
        wrongAnswers = learningData.word
            .filter((_, index) => index !== currentItemIndex)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(item => item.word);
    } else if (currentLevel === 'combination') {
        wrongAnswers = learningData.combination
            .filter((_, index) => index !== currentItemIndex)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(item => item.result);
    } else {
        wrongAnswers = currentData
            .filter((_, index) => index !== currentItemIndex)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(item => item.letter);
    }
    
    // 전체 선택지 (정답 + 오답 4개) 랜덤 배치
    const allChoices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    // 선택지 컨테이너 결정
    const containerMap = {
        consonant: 'letterChoices',
        vowel: 'vowelChoices',
        combination: 'combinationChoices',
        word: 'wordChoices'
    };
    
    const container = document.getElementById(containerMap[currentLevel]);
    container.innerHTML = '';
    
    allChoices.forEach(choice => {
        const choiceBtn = document.createElement('button');
        choiceBtn.className = 'letter-choice-btn';
        choiceBtn.textContent = choice;
        choiceBtn.onclick = () => selectChoice(choice, correctAnswer);
        container.appendChild(choiceBtn);
    });
}

// 선택 처리
function selectChoice(selectedChoice, correctAnswer) {
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedChoice === correctAnswer;
    
    // 통계 업데이트
    updateStats(isCorrect, responseTime, selectedChoice, correctAnswer);
    
    const buttons = document.querySelectorAll('.letter-choice-btn');
    
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
    
    if (isCorrect) {
        updateTutorMessage('🎉 정답이에요!', 
            `"${selectedChoice}"를 정확히 찾았네요! ${responseTime}초 만에 맞혔어요! 👏`);
        setTimeout(() => {
            markActivity(true);
            resetChoices();
        }, 1500);
    } else {
        updateTutorMessage('😊 다시 생각해보세요!', 
            `조금 다른 것 같아요. 힌트를 다시 보고 천천히 찾아보세요! 💡`);
        setTimeout(() => {
            resetChoices();
            generateRandomChoices(); // 틀렸을 때 새로운 선택지 생성
        }, 2000);
    }
}

// 통계 업데이트
function updateStats(isCorrect, responseTime, selectedChoice, correctAnswer) {
    learningStats.totalQuestions++;
    learningStats.totalResponseTime += responseTime;
    
    if (isCorrect) {
        learningStats.correctAnswers++;
    }
    
    // 개별 응답 기록
    learningStats.responses.push({
        level: currentLevel,
        itemIndex: currentItemIndex,
        repeat: currentRepeat,
        correct: isCorrect,
        responseTime: responseTime,
        selectedChoice: selectedChoice,
        correctAnswer: correctAnswer,
        timestamp: Date.now()
    });
    
    updateStatsDisplay();
    saveLearningStats(); // 통계 변경 시 저장
}

// 통계 표시 업데이트
function updateStatsDisplay() {
    document.getElementById('currentProgress').textContent = learningStats.totalQuestions;
    document.getElementById('repeatProgress').textContent = learningStats.correctAnswers;
    
    const accuracy = learningStats.totalQuestions > 0 ? 
        Math.round((learningStats.correctAnswers / learningStats.totalQuestions) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    const avgTime = learningStats.totalQuestions > 0 ? 
        Math.round(learningStats.totalResponseTime / learningStats.totalQuestions) : 0;
    document.getElementById('avgTime').textContent = avgTime + '초';
}

// 선택지 리셋
function resetChoices() {
    const buttons = document.querySelectorAll('.letter-choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.style.pointerEvents = 'auto';
    });
    startTimer(); // 새 문제 시작시 타이머 리셋
}

// 활동 평가
function markActivity(isCorrect) {
    if (isCorrect) {
        if (currentRepeat < repeatSettings.correct) {
            currentRepeat++;
            updateProgressDisplay();
            updateTutorMessage('✨ 한 번 더!', 
                `잘했어요! ${currentRepeat}/${repeatSettings.correct}번 반복 중이에요. 계속해봐요! 💪`);
            setTimeout(() => {
                generateRandomChoices(); // 새로운 선택지로 반복
                saveLearningState(); // 반복 진행 시 저장
            }, 1000);
        } else {
            // 현재 항목 완료
            updateTutorMessage('🏆 완료!', 
                `이 글자를 완전히 익혔어요! 다음 글자로 넘어가볼까요? 🎉`);
            nextItem()
        }
    } else {
        // 틀렸을 때는 선택지가 이미 generateRandomChoices()로 새로 생성됨
        updateTutorMessage('💪 다시 도전!', 
            `괜찮아요! 다시 한번 찾아보세요. 힌트를 잘 보세요! 🔍`);
    }
}

// 다음 항목
function nextItem() {
    const maxIndex = learningData[currentLevel].length - 1;
    
    if (currentRepeat >= repeatSettings.correct) {
        if (currentItemIndex < maxIndex) {
            // 다음 항목으로
            currentItemIndex++;
            currentRepeat = 1;
            updateContent();
            updateLevelMessage();
            startTimer();
            saveLearningState(); // 다음 항목 진행 시 저장
        } else {
            // 레벨 완료
            showLevelComplete();
        }
    } else {
        updateTutorMessage('🔄 반복 완료 필요', 
            `현재 글자를 ${repeatSettings.correct}번 반복해야 다음으로 넘어갈 수 있어요! 현재 ${currentRepeat}/${repeatSettings.correct}번 완료했어요. 💪`);
    }
}

// 레벨 완료 표시
function showLevelComplete() {
    const levelNames = {
        consonant: '자음 보기',
        vowel: '모음 보기', 
        combination: '글자 보기',
        word: '단어 보기'
    };
    
    updateTutorMessage('🏆 레벨 완료!', 
        `${levelNames[currentLevel]} 단계를 모두 완료했어요! 정말 대단해요! 다음 단계로 넘어가볼까요? 🎉`);
    
    // 다음 레벨 자동 활성화
    const levels = ['consonant', 'vowel', 'combination', 'word'];
    const currentLevelIndex = levels.indexOf(currentLevel);
    if (currentLevelIndex < levels.length - 1) {
        setTimeout(() => {
            const nextLevel = levels[currentLevelIndex + 1];
            selectLevel(nextLevel);
        }, 2000);
    } else {
        // 모든 레벨 완료
        updateTutorMessage('🎊 전체 완료!', 
            `모든 단계를 완료했어요! 정말 훌륭해요! 한글을 정말 잘 배우셨네요! 🌟`);
    }
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
        consonant: '자음은 한글의 기본이 되는 글자예요. 글자의 모양과 힌트 이미지를 잘 보고 기억해주세요!',
        vowel: '모음은 자음과 함께 써서 완전한 글자를 만들어요. 모음의 모양과 소리를 잘 익혀보세요!',
        combination: '자음과 모음을 합치면 완전한 글자가 돼요. 어떻게 합쳐지는지 잘 관찰하세요!',
        word: '여러 글자가 모이면 단어가 돼요. 단어의 의미와 이미지를 함께 기억하세요!'
    };
    
    updateTutorMessage('💡 도움말', helpMessages[currentLevel]);
}

// 통계 초기화
function resetStats() {
    if (confirm('학습 통계를 초기화하시겠습니까?')) {
        learningStats = {
            totalQuestions: 0,
            correctAnswers: 0,
            totalResponseTime: 0,
            responses: [],
            sessionStartTime: Date.now()
        };
        updateStatsDisplay();
        saveLearningStats(); // 통계 초기화 시 저장
        updateTutorMessage('📊 통계 초기화', '학습 통계가 초기화되었어요! 새로운 마음으로 시작해봐요! 🌟');
    }
}

// ========== 페이지 로드 시 초기화 ==========

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    // 저장된 데이터 로드
    loadSettings();
    loadLearningStats();
    
    // 저장된 학습 상태가 있으면 로드, 없으면 기본값으로 시작
    if (!loadLearningState()) {
        selectLevel('consonant');
        updateTutorMessage('👋 환영해요!', 
            '한글 보기 단계 학습에 오신 것을 환영해요! 글자를 천천히 보고 특징을 기억하면서 학습해봐요! 📚✨');
    } else {
        // 로드된 상태로 UI 업데이트
        const levelMap = {
            consonant: 0,
            vowel: 1,
            combination: 2,
            word: 3
        };
        
        // 적절한 레벨 버튼 활성화
        document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.level-btn')[levelMap[currentLevel]].classList.add('active');
        
        // 적절한 영역 표시
        document.querySelectorAll('#consonantArea, #vowelArea, #combinationArea, #wordArea').forEach(area => {
            area.style.display = 'none';
        });
        
        const areaMap = {
            consonant: 'consonantArea',
            vowel: 'vowelArea', 
            combination: 'combinationArea',
            word: 'wordArea'
        };
        
        document.getElementById(areaMap[currentLevel]).style.display = 'block';
        
        updateContent();
        updateLevelMessage();
    }

    await initCamera();
    handleStart()    
    
    startTimer();
    updateLastSaveTime();
});

// 페이지 이동/새로고침 시 자동 저장
window.addEventListener('beforeunload', () => {
    saveLearningState();
    saveLearningStats();
    saveSettings();
});

// 주기적 자동 저장 (30초마다)
setInterval(() => {
    saveLearningState();
    saveLearningStats();
}, 30000);

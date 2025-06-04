// 전역 상태 관리
let currentLevel = 'consonant'; // consonant, vowel, combination, word
let currentStage = 'view'; // view, listen, write, speak
let currentItemIndex = 0;

// 반복 설정
let repeatSettings = {
    correct: 3,
    incorrect: 5
};

// 학습 데이터베이스
const learningData = {
    consonant: [
        { letter: 'ㄱ', name: '기역', sound: '[ㄱ]', example: '고양이의 ㄱ' },
        { letter: 'ㄴ', name: '니은', sound: '[ㄴ]', example: '나비의 ㄴ' },
        { letter: 'ㄷ', name: '디귿', sound: '[ㄷ]', example: '다람쥐의 ㄷ' },
        { letter: 'ㄹ', name: '리을', sound: '[ㄹ]', example: '라면의 ㄹ' },
        { letter: 'ㅁ', name: '미음', sound: '[ㅁ]', example: '모자의 ㅁ' },
        { letter: 'ㅂ', name: '비읍', sound: '[ㅂ]', example: '바나나의 ㅂ' },
        { letter: 'ㅅ', name: '시옷', sound: '[ㅅ]', example: '사과의 ㅅ' },
        { letter: 'ㅇ', name: '이응', sound: '[ㅇ]', example: '아기의 ㅇ' },
        { letter: 'ㅈ', name: '지읒', sound: '[ㅈ]', example: '자동차의 ㅈ' },
        { letter: 'ㅊ', name: '치읓', sound: '[ㅊ]', example: '치킨의 ㅊ' }
    ],
    vowel: [
        { letter: 'ㅏ', name: '아', sound: '[아]', example: '아기의 ㅏ' },
        { letter: 'ㅑ', name: '야', sound: '[야]', example: '야구의 ㅑ' },
        { letter: 'ㅓ', name: '어', sound: '[어]', example: '어머니의 ㅓ' },
        { letter: 'ㅕ', name: '여', sound: '[여]', example: '여우의 ㅕ' },
        { letter: 'ㅗ', name: '오', sound: '[오]', example: '오리의 ㅗ' },
        { letter: 'ㅛ', name: '요', sound: '[요]', example: '요구르트의 ㅛ' },
        { letter: 'ㅜ', name: '우', sound: '[우]', example: '우유의 ㅜ' },
        { letter: 'ㅠ', name: '유', sound: '[유]', example: '유리의 ㅠ' },
        { letter: 'ㅡ', name: '으', sound: '[으]', example: '으음의 ㅡ' },
        { letter: 'ㅣ', name: '이', sound: '[이]', example: '이빨의 ㅣ' }
    ],
    combination: [
        { consonant: 'ㄱ', vowel: 'ㅏ', result: '가', meaning: '가방의 가' },
        { consonant: 'ㄴ', vowel: 'ㅏ', result: '나', meaning: '나비의 나' },
        { consonant: 'ㄷ', vowel: 'ㅏ', result: '다', meaning: '다람쥐의 다' },
        { consonant: 'ㄹ', vowel: 'ㅏ', result: '라', meaning: '라면의 라' },
        { consonant: 'ㅁ', vowel: 'ㅏ', result: '마', meaning: '마음의 마' },
        { consonant: 'ㅂ', vowel: 'ㅏ', result: '바', meaning: '바나나의 바' },
        { consonant: 'ㅅ', vowel: 'ㅏ', result: '사', meaning: '사과의 사' },
        { consonant: 'ㅇ', vowel: 'ㅏ', result: '아', meaning: '아기의 아' },
        { consonant: 'ㅈ', vowel: 'ㅏ', result: '자', meaning: '자동차의 자' },
        { consonant: 'ㅊ', vowel: 'ㅏ', result: '차', meaning: '차의 차' }
    ],
    word: [
        { word: '가방', syllables: ['가', '방'], image: '🎒', meaning: '책을 넣는 것' },
        { word: '나비', syllables: ['나', '비'], image: '🦋', meaning: '예쁜 날개가 있는 곤충' },
        { word: '다리', syllables: ['다', '리'], image: '🦵', meaning: '걸을 때 사용하는 몸의 부분' },
        { word: '라면', syllables: ['라', '면'], image: '🍜', meaning: '맛있는 면 요리' },
        { word: '마음', syllables: ['마', '음'], image: '❤️', meaning: '사랑하는 기분' },
        { word: '바다', syllables: ['바', '다'], image: '🌊', meaning: '넓고 푸른 물' },
        { word: '사과', syllables: ['사', '과'], image: '🍎', meaning: '빨간 과일' },
        { word: '아기', syllables: ['아', '기'], image: '👶', meaning: '작고 귀여운 사람' }
    ]
};

// 현재 학습 상태
let learningState = {
    view: { completed: false, currentRepeat: 1, maxRepeat: 3 },
    listen: { completed: false, currentRepeat: 1, maxRepeat: 3 },
    write: { completed: false, currentRepeat: 1, maxRepeat: 3 },
    speak: { completed: false, currentRepeat: 1, maxRepeat: 3 }
};

// 레벨 선택
function selectLevel(level) {
    // 레벨 버튼 상태 업데이트
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentLevel = level;
    currentItemIndex = 0;
    
    // 모든 영역 숨기기
    document.querySelectorAll('.consonant-area, .vowel-area, .combination-area, .word-area').forEach(area => {
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
    
    // 첫 번째 단계로 리셋
    switchStage('view');
    
    // 콘텐츠 업데이트
    updateContent();
    updateLevelMessage();
}

// 레벨별 메시지 업데이트
function updateLevelMessage() {
    const messages = {
        consonant: {
            title: '자음 배우기',
            subtitle: `기초 자음 '${learningData.consonant[currentItemIndex].letter}' 학습하기`,
            message: `한글의 기본이 되는 자음을 배워봐요! 첫 번째 자음 '${learningData.consonant[currentItemIndex].letter}'부터 시작해볼까요? 📚`
        },
        vowel: {
            title: '모음 배우기',
            subtitle: `기초 모음 '${learningData.vowel[currentItemIndex].letter}' 학습하기`,
            message: `이제 모음을 배워볼 시간이에요! 첫 번째 모음 '${learningData.vowel[currentItemIndex].letter}'부터 차근차근 해봐요! 🎵`
        },
        combination: {
            title: '글자 만들기',
            subtitle: `'${learningData.combination[currentItemIndex].result}' 글자 만들기`,
            message: `자음과 모음을 합쳐서 진짜 글자를 만들어봐요! ${learningData.combination[currentItemIndex].consonant} + ${learningData.combination[currentItemIndex].vowel} = ${learningData.combination[currentItemIndex].result} ✨`
        },
        word: {
            title: '단어 배우기',
            subtitle: `'${learningData.word[currentItemIndex].word}' 단어 학습하기`,
            message: `드디어 완전한 단어를 배우는 시간이에요! '${learningData.word[currentItemIndex].word}'라는 단어를 배워봐요! 🏆`
        }
    };
    
    const levelInfo = messages[currentLevel];
    document.getElementById('lessonTitle').textContent = levelInfo.title;
    document.getElementById('lessonSubtitle').textContent = levelInfo.subtitle;
    updateTutorMessage(levelInfo.title, levelInfo.message);
}

// 콘텐츠 업데이트
function updateContent() {
    switch(currentLevel) {
        case 'consonant':
            updateConsonantContent();
            break;
        case 'vowel':
            updateVowelContent();
            break;
        case 'combination':
            updateCombinationContent();
            break;
        case 'word':
            updateWordContent();
            break;
    }
}

// 자음 콘텐츠 업데이트
function updateConsonantContent() {
    const item = learningData.consonant[currentItemIndex];
    document.getElementById('currentLetter').textContent = item.letter;
    document.getElementById('letterName').textContent = item.name;
    document.getElementById('letterSound').textContent = item.sound;
    document.getElementById('letterExample').textContent = item.example;
    document.getElementById('targetLetter').textContent = item.letter;
    
    generateLetterChoices('letterChoices', 'consonant');
}

// 모음 콘텐츠 업데이트
function updateVowelContent() {
    const item = learningData.vowel[currentItemIndex];
    document.getElementById('currentVowel').textContent = item.letter;
    document.getElementById('vowelName').textContent = item.name;
    document.getElementById('vowelSound').textContent = item.sound;
    document.getElementById('vowelExample').textContent = item.example;
    document.getElementById('targetVowel').textContent = item.letter;
    
    generateLetterChoices('vowelChoices', 'vowel');
}

// 조합 콘텐츠 업데이트
function updateCombinationContent() {
    const item = learningData.combination[currentItemIndex];
    document.getElementById('combConsonant').textContent = item.consonant;
    document.getElementById('combVowel').textContent = item.vowel;
    document.getElementById('combResult').textContent = item.result;
    document.getElementById('targetCombination').textContent = item.result;
    
    generateLetterChoices('combinationChoices', 'combination');
}

// 단어 콘텐츠 업데이트
function updateWordContent() {
    const item = learningData.word[currentItemIndex];
    document.getElementById('syllable1').textContent = item.syllables[0];
    document.getElementById('syllable2').textContent = item.syllables[1] || '';
    document.getElementById('wordImage').textContent = item.image;
    document.getElementById('targetWord').textContent = item.word;
    
    // 두 번째 음절이 없으면 숨기기
    if (!item.syllables[1]) {
        document.getElementById('syllable2').style.display = 'none';
    } else {
        document.getElementById('syllable2').style.display = 'flex';
    }
    
    generateLetterChoices('wordChoices', 'word');
}

// 선택지 생성
function generateLetterChoices(containerId, type) {
    const container = document.getElementById(containerId);
    const currentData = learningData[type];
    const currentItem = currentData[currentItemIndex];
    
    // 정답 결정
    let correctAnswer;
    switch(type) {
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
    if (type === 'word') {
        wrongAnswers = learningData.word
            .filter((_, index) => index !== currentItemIndex)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(item => item.word);
    } else if (type === 'combination') {
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
    
    // 전체 선택지 (정답 + 오답 4개)
    const allChoices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
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
    const isCorrect = selectedChoice === correctAnswer;
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
            `"${selectedChoice}"를 정확히 찾았네요! 정말 잘했어요! 👏`);
        setTimeout(() => {
            markActivity(true);
            resetChoices();
        }, 1500);
    } else {
        updateTutorMessage('😊 다시 생각해보세요!', 
            `조금 다른 것 같아요. 다시 한번 찾아보세요! 힌트를 잘 보세요! 💡`);
        setTimeout(() => {
            resetChoices();
        }, 2000);
    }
}

// 선택지 리셋
function resetChoices() {
    const buttons = document.querySelectorAll('.letter-choice-btn');
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.style.pointerEvents = 'auto';
    });
}

// 단계 전환
function switchStage(stage) {
    // 모든 버튼 비활성화
    document.querySelectorAll('.stage-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 단계 활성화
    document.getElementById(stage + 'Btn').classList.add('active');
    
    currentStage = stage;
    updateStageMessage();
    updateRepeatDisplay();
}

// 단계별 메시지
function updateStageMessage() {
    const messages = {
        view: '👀 보기 단계: 글자를 천천히 살펴보고 특징을 기억하세요!',
        listen: '👂 듣기 단계: 소리를 들어보고 맞는 글자를 찾아보세요!',
        write: '✏️ 쓰기 단계: 직접 써보면서 글자 모양을 익혀보세요!',
        speak: '🗣️ 말하기 단계: 소리내어 읽어보면서 발음을 연습하세요!'
    };
    
    updateTutorMessage('현재 단계', messages[currentStage]);
}

// AI 튜터 메시지 업데이트
function updateTutorMessage(title, message) {
    const tutorMessage = document.getElementById('tutorMessage');
    tutorMessage.innerHTML = `<strong>${title}</strong><br><br>${message}`;
}

// 반복 회수 조정
function adjustRepeat(type, delta) {
    const newValue = repeatSettings[type] + delta;
    if (newValue >= 1 && newValue <= 10) {
        repeatSettings[type] = newValue;
        document.getElementById(type + 'Repeat').textContent = newValue;
        
        updateTutorMessage('설정 변경', 
            `${type === 'correct' ? '맞췄을 때' : '틀렸을 때'} 반복 횟수가 ${newValue}회로 설정되었어요! 👍`);
    }
}

// 반복 표시 업데이트
function updateRepeatDisplay() {
    const state = learningState[currentStage];
    const statusElement = document.getElementById('repeatStatus');
    statusElement.textContent = `반복: ${state.currentRepeat}/${state.maxRepeat}`;
}

// 활동 평가
function markActivity(isCorrect) {
    const state = learningState[currentStage];
    
    if (isCorrect) {
        if (state.currentRepeat < repeatSettings.correct) {
            state.currentRepeat++;
            updateRepeatDisplay();
            showFeedback(true, false);
        } else {
            state.completed = true;
            document.getElementById(currentStage + 'Btn').classList.add('completed');
            showFeedback(true, true);
        }
    } else {
        state.maxRepeat = repeatSettings.incorrect;
        state.currentRepeat = Math.min(state.currentRepeat + 1, state.maxRepeat);
        updateRepeatDisplay();
        showFeedback(false, false);
    }
}

// 다음 항목
function nextItem() {
    const maxIndex = learningData[currentLevel].length - 1;
    
    if (learningState[currentStage].completed) {
        // 모든 단계 완료되었는지 확인
        const allCompleted = Object.values(learningState).every(stage => stage.completed);
        
        if (allCompleted) {
            if (currentItemIndex < maxIndex) {
                // 다음 항목으로
                currentItemIndex++;
                resetLearningState();
                updateContent();
                switchStage('view');
                updateLevelMessage();
            } else {
                // 레벨 완료
                showLevelComplete();
            }
        } else {
            updateTutorMessage('🔄 단계 완료 필요', 
                '모든 단계를 완료한 후에 다음으로 넘어갈 수 있어요! 💪');
        }
    } else {
        updateTutorMessage('🔄 현재 단계 완료 필요', 
            '현재 단계를 완료한 후에 다음으로 넘어갈 수 있어요! 💪');
    }
}

// 학습 상태 리셋
function resetLearningState() {
    Object.keys(learningState).forEach(stage => {
        learningState[stage] = { 
            completed: false, 
            currentRepeat: 1, 
            maxRepeat: repeatSettings.correct 
        };
        document.getElementById(stage + 'Btn').classList.remove('completed');
    });
}

// 레벨 완료 표시
function showLevelComplete() {
    const levelNames = {
        consonant: '자음 배우기',
        vowel: '모음 배우기', 
        combination: '글자 만들기',
        word: '단어 배우기'
    };
    
    updateTutorMessage('🏆 레벨 완료!', 
        `${levelNames[currentLevel]} 단계를 모두 완료했어요! 정말 대단해요! 다음 단계로 넘어가볼까요? 🎉`);
}

// 피드백 표시
function showFeedback(isCorrect, isStageComplete) {
    const overlay = document.getElementById('feedbackOverlay');
    const icon = document.getElementById('feedbackIcon');
    const text = document.getElementById('feedbackText');
    
    if (isCorrect) {
        if (isStageComplete) {
            icon.textContent = '🏆';
            text.textContent = `${getStageKoreanName(currentStage)} 단계를 완료했어요!`;
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

// 단계 한국어 이름
function getStageKoreanName(stage) {
    const names = {
        view: '보기',
        listen: '듣기',
        write: '쓰기',
        speak: '말하기'
    };
    return names[stage];
}

// 피드백 닫기
function closeFeedback() {
    document.getElementById('feedbackOverlay').style.display = 'none';
}

// 도움말
function getTutorHelp() {
    const helpMessages = {
        consonant: '자음은 한글의 기본이 되는 글자예요. 각 자음의 모양과 소리를 잘 기억해주세요!',
        vowel: '모음은 자음과 함께 써서 완전한 글자를 만들어요. 모음의 모양과 소리를 익혀보세요!',
        combination: '자음과 모음을 합치면 완전한 글자가 돼요. 어떻게 합쳐지는지 잘 보세요!',
        word: '여러 글자가 모이면 단어가 돼요. 단어의 의미도 함께 배워보세요!'
    };
    
    updateTutorMessage('💡 도움말', helpMessages[currentLevel]);
}

// 지시사항 다시 듣기 (TTS)
function repeatInstruction() {
    const message = document.getElementById('tutorMessage').textContent;
    
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR';
        utterance.rate = 0.7;
        speechSynthesis.speak(utterance);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    selectLevel('consonant');
    
    setTimeout(() => {
        updateTutorMessage('👋 환영해요!', 
            '한글을 처음 배우는 특별한 시간이에요! 자음부터 천천히 시작해봐요! 📚✨');
    }, 1000);
});
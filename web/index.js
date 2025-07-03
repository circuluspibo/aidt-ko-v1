let currentStep = 1;
let selectedProfile = null;
let selectedContent = null;
let selectedMethod = null;

// 프로필 선택
function selectProfile(profileType) {
    // 이전 선택 해제
    document.querySelectorAll('.profile-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 새 선택 적용
    event.currentTarget.classList.add('selected');
    selectedProfile = profileType;
    
    // 다음 버튼 활성화
    document.getElementById('nextButton').disabled = false;
    document.getElementById('nextButton').textContent = '다음 단계로 가기 🚀';
    
    // 선택한 프로필에 따른 개인화 메시지
    showPersonalizedMessage(profileType);
}

// 학습 내용 선택
function selectContent(contentType) {
    // 이전 선택 해제
    document.querySelectorAll('.content-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 새 선택 적용
    event.currentTarget.classList.add('selected');
    selectedContent = contentType;
    
    // 다음 버튼 활성화
    document.getElementById('nextButton').disabled = false;
    document.getElementById('nextButton').textContent = '학습 방법 선택하기 📚';
}

// 개인화 메시지 표시
function showPersonalizedMessage(profileType) {
    const messages = {
        'slow-learner': '천천히 배우는 것이 가장 좋은 방법이에요! 🐌',
        'attention-difficulty': '재미있고 짧은 시간으로 배워봐요! 🦋',
        'memory-difficulty': '반복해서 배우면 더 오래 기억해요! 🐘',
        'visual-learner': '예쁜 그림과 색깔로 배워봐요! 👀',
        'auditory-learner': '신나는 소리와 음악으로 배워봐요! 👂',
        'kinesthetic-learner': '직접 만지고 움직이며 배워봐요! ✋',
        'social-learner': '함께 배우면 더 재미있어요! 👫',
        'independent-learner': '나만의 속도로 차분히 배워봐요! 🦉',
        'creative-learner': '상상력과 창의력으로 배워봐요! 🎨'
    };
    
    const guideMessage = document.querySelector('#profileStep .guide-message');
    guideMessage.textContent = messages[profileType];
    guideMessage.style.background = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
    guideMessage.style.borderColor = '#10b981';
    guideMessage.style.color = '#065f46';
}

// 다음 단계로 이동
function nextStep() {
    if (currentStep === 1 && selectedProfile) {
        // 프로필 선택 완료 → 학습 내용 선택
        document.getElementById('profileStep').style.display = 'none';
        document.getElementById('contentStep').style.display = 'block';
        
        // 진행 상태 업데이트
        document.getElementById('step1').classList.remove('current');
        document.getElementById('step1').classList.add('completed');
        document.getElementById('step2').classList.add('current');
        
        currentStep = 2;
        document.getElementById('nextButton').disabled = true;
        document.getElementById('nextButton').textContent = '학습 내용을 선택해주세요 📚';
        
    } else if (currentStep === 2 && selectedContent) {
        // 학습 내용 선택 완료 → 학습 방법 선택
        document.getElementById('contentStep').style.display = 'none';
        document.getElementById('methodStep').style.display = 'block';
        
        // 진행 상태 업데이트
        document.getElementById('step2').classList.remove('current');
        document.getElementById('step2').classList.add('completed');
        document.getElementById('step3').classList.add('current');
        
        currentStep = 3;
        document.getElementById('nextButton').style.display = 'none';
        
        // 선택한 프로필과 내용에 따라 학습 방법 URL에 파라미터 추가
        updateMethodLinks();
    }
}

// 학습 방법 링크 업데이트
function updateMethodLinks() {
    const params = `?profile=${selectedProfile}&content=${selectedContent}`;
    
    document.getElementById('viewMethod').href = `view.html${params}`;
    document.getElementById('listenMethod').href = `listen.html${params}`;
    document.getElementById('speakMethod').href = `speak.html${params}`;
    document.getElementById('writeMethod').href = `write.html${params}`;
}

// 페이지 로드 시 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    // 카드들에 순차적 등장 애니메이션
    const cards = document.querySelectorAll('.profile-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// 선택 사항 저장 (localStorage 사용)
function saveSelections() {
    const selections = {
        profile: selectedProfile,
        content: selectedContent,
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('hangul_learning_selections', JSON.stringify(selections));
    } catch (error) {
        console.error('선택 사항 저장 실패:', error);
    }
}

// 선택 사항 로드
function loadSelections() {
    try {
        const saved = localStorage.getItem('hangul_learning_selections');
        if (saved) {
            const selections = JSON.parse(saved);
            
            // 24시간 이내의 선택만 복원
            const savedTime = new Date(selections.timestamp);
            const now = new Date();
            const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                selectedProfile = selections.profile;
                selectedContent = selections.content;
                
                // UI에 이전 선택 표시
                if (selectedProfile) {
                    document.querySelector(`[onclick="selectProfile('${selectedProfile}')"]`)?.classList.add('selected');
                }
            }
        }
    } catch (error) {
        console.error('선택 사항 로드 실패:', error);
    }
}

// 페이지 이동 시 선택 사항 저장
window.addEventListener('beforeunload', saveSelections);

// 선택 변경 시마다 저장
function selectProfile(profileType) {
    // 이전 선택 해제
    document.querySelectorAll('.profile-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 새 선택 적용
    event.currentTarget.classList.add('selected');
    selectedProfile = profileType;
    
    // 다음 버튼 활성화
    document.getElementById('nextButton').disabled = false;
    document.getElementById('nextButton').textContent = '다음 단계로 가기 🚀';
    
    // 선택한 프로필에 따른 개인화 메시지
    showPersonalizedMessage(profileType);
    
    // 선택 사항 저장
    saveSelections();
}

function selectContent(contentType) {
    // 이전 선택 해제
    document.querySelectorAll('.content-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // 새 선택 적용
    event.currentTarget.classList.add('selected');
    selectedContent = contentType;
    
    // 다음 버튼 활성화
    document.getElementById('nextButton').disabled = false;
    document.getElementById('nextButton').textContent = '학습 방법 선택하기 📚';
    
    // 선택 사항 저장
    saveSelections();
}

// 접근성 향상을 위한 키보드 네비게이션
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('profile-card')) {
            e.target.click();
        } else if (e.target.classList.contains('content-card')) {
            e.target.click();
        } else if (e.target.classList.contains('method-card')) {
            e.target.click();
        }
    }
});

// 카드에 포커스 가능하도록 설정
document.querySelectorAll('.profile-card, .content-card, .method-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    
    // 포커스 스타일 추가
    card.addEventListener('focus', function() {
        this.style.outline = '4px solid #3b82f6';
        this.style.outlineOffset = '2px';
    });
    
    card.addEventListener('blur', function() {
        this.style.outline = 'none';
    });
});

// 초기화 시 이전 선택사항 로드
window.addEventListener('load', loadSelections);
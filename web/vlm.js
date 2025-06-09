const video = document.getElementById('videoFeed');
const cv = document.getElementById('canvas');
const baseURL = 'http://localhost:8080'; // Change this to your server URL
const instructionText = document.getElementById('instructionText');
//const responseText = document.getElementById('responseText');
const intervalSelect = document.getElementById('intervalSelect');
const startButton = document.getElementById('startButton');

//instructionText.value = "What do you see?"; // default instruction

let stream;
let intervalId;
let isProcessing = false;
let isFocused = false;


class AttentionFilter {
  constructor(windowSize = 10, threshold = 0.6) {
    this.windowSize = windowSize; // 최근 10초간 유지
    this.threshold = threshold;   // yes 비율 60% 이상이면 집중으로 간주
    this.history = [];            // 응답 기록 (true: yes, false: no)
  }

  // 새 응답 처리 (문장 입력)
  update(responseText) {
    const isYes = responseText.toLowerCase().includes("yes");
    this.history.push(isYes);

    // 최대 windowSize 유지
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    return this.isFocused();
  }

  // 최근 평균 기반 집중 여부 판단
  isFocused() {
    if (this.history.length === 0) return false;
    const yesCount = this.history.filter(Boolean).length;
    const focusRatio = yesCount / this.history.length;
    return focusRatio >= this.threshold;
  }
}

// 예시 사용
const filter = new AttentionFilter(10, 0.6); // 10초 창, 60% 이상 yes면 집중


// Returns response text (string)
async function sendChatCompletionRequest(instruction, imageBase64URL) {
    const response = await fetch(`${baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            max_tokens: 100,
            messages: [
                { role: 'user', content: [
                    { type: 'text', text: instruction },
                    { type: 'image_url', image_url: {
                        url: imageBase64URL,
                    } }
                ] },
            ]
        })
    });
    if (!response.ok) {
        const errorData = await response.text();
        return `Server error: ${response.status} - ${errorData}`;
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

// 1. Ask for camera permission on load
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
        //responseText.value = "Camera access granted. Ready to start.";
    } catch (err) {
        console.error("Error accessing camera:", err);
        //responseText.value = `Error accessing camera: ${err.name} - ${err.message}. Please ensure permissions are granted and you are on HTTPS or localhost.`;
        alert(`Error accessing camera: ${err.name}. Make sure you've granted permission and are on HTTPS or localhost.`);
    }
}

function captureImage() {
    if (!stream || !video.videoWidth) {
        console.warn("Video stream not ready for capture.");
        return null;
    }
    cv.width = video.videoWidth;
    cv.height = video.videoHeight;
    const context = cv.getContext('2d');
    context.drawImage(video, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.8); // Use JPEG for smaller size, 0.8 quality
}

async function sendData() {
    if (!isProcessing) return; // Ensure we don't have overlapping requests if processing takes longer than interval

    const instruction = 'Is someone staring straight ahead? Please answer yes or no and describe the surroundings further.'; // Use the instruction from the input field
    const imageBase64URL = captureImage();

    if (!imageBase64URL) {
        //responseText.value = "Failed to capture image. Stream might not be active.";
        // Optionally stop processing if image capture fails consistently
        // handleStop();
        return;
    }

    const payload = {
        instruction: instruction,
        imageBase64URL: imageBase64URL
    };

    try {
        const response = await sendChatCompletionRequest(payload.instruction, payload.imageBase64URL);
        isFocused = filter.update(response);
        
        console.log(isFocused, response);

        //responseText.value = response;
    } catch (error) {
        console.error('Error sending data:', error);
        //responseText.value = `Error: ${error.message}`;
    }
}

function handleStart() {
    if (!stream) {
        //responseText.value = "Camera not available. Cannot start.";
        alert("Camera not available. Please grant permission first.");
        return;
    }
    isProcessing = true;
    //startButton.textContent = "Stop";
    //startButton.classList.remove('start');
    //startButton.classList.add('stop');

    //instructionText.disabled = true;
    //intervalSelect.disabled = true;

    //responseText.value = "Processing started...";

    const intervalMs = parseInt(1000, 10);
    
    // Initial immediate call
    sendData(); 
    
    // Then set interval
    intervalId = setInterval(sendData, intervalMs);
}

function handleStop() {
    isProcessing = false;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    //startButton.textContent = "Start";
    //startButton.classList.remove('stop');
    //startButton.classList.add('start');

    //instructionText.disabled = false;
    //intervalSelect.disabled = false;
    //if (responseText.value.startsWith("Processing started...")) {
    //    responseText.value = "Processing stopped.";
    //}
}

let messages = [];
let history = [];
let audio = 0 
let lastTime = 0


function tutor(message){
    if(Date.now() - lastTime < 10000) {
        return
    }

    lastTime = Date.now()


    const text = `해당 학생 수업에 집중을 ${isFocused ? '잘 하고 있어' : '못하고 있어.'}, ${message} 라는 멘트를 지금 수업받는 학생이 보다 의미있게 들을수 있도록 짧은 대답을 만들어줘`
    fetch('https://ai-cpu.circul.us/v1/txt2chat?isThink=0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: text,
            history : history.slice(-4),
            lang: "auto",
            type: '당신은 한글을 처음 배우는 어린이들을 위한 AI 튜터입니다. 특수교육 대상자의 아이들을 위해 친절하고 쉽게 설명 몇 지도해 주세요.',
            //temp: 0.6, top_p: 0.95, top_k: 20, max: 32768
        })
    }).then(function(response) {
        return response.body.getReader();
    }).then(function(reader) {
        var decoder = new TextDecoder();
        var botResponse = '';
        
        //hideTyping();
        var botMessage = { type: 'bot', content: '', timestamp: new Date() };
        messages.push(botMessage);

        function readStream() {
            return reader.read().then(function(result) {
                if (result.done) {
                    history.push({ role: 'user', content: text })
                    history.push({ role: 'assistant', content: botResponse })
                    console.log('final', botResponse)
                    speakText(botResponse)
                    

                    return;
                }
                const chunk = decoder.decode(result.value)
                console.log(chunk)
                botResponse += chunk + "\n"
                messages[messages.length - 1].content = botResponse;
                return readStream();
            });
        }
        return readStream();
    }).catch(function(error) {
        //hideTyping();
        messages.push({ type: 'bot', content: '죄송해요, 오류가 발생했어요. 😅', timestamp: new Date() });
        //renderMessages();
    });
}

function speakText(text, voice='main') {
    if (audio) audio.pause();
    audio = new Audio(`https://oe-sapi.circul.us/tts?text=${encodeURIComponent(text.replace(/[.!?]/g, ''))}&lang=ko&voice=${voice}`)//`https://ai-cpu.circul.us/v1/tts?text=${encodeURIComponent(text)}&lang=ko`);
    audio.play();
}
// DOM Elements
const input = document.getElementById('input');
const output = document.getElementById('output');
const enterBtn = document.getElementById('enter-btn');
const voiceBtn = document.getElementById('voice-btn');
const chatInputBox = document.getElementById('chat-input-box');
const voiceInputContainer = document.querySelector('.voice-input-container');
const alertContainer = document.querySelector('.alert-container');
const alertText = document.getElementById('alert-text');
const alertCloseBtn = document.querySelector('.btn-close');

chatInputBox.addEventListener('submit',(e)=>{
    e.preventDefault();
    chat();
} 
);

async function chat() {
  try {
    // Your prompt or message
    const message = input.value;
    input.value='';
    output.textContent = "Thinking...";
    const response = await fetch(config.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat:free",
        "messages": [
          {
            "role": "user",
            "content": message
          }
        ]
      })
    });

    const data = await response.json();
    output.textContent = "";
    const outputText = data.choices[0].message.content;
    const htmlText = marked.parse(outputText); 
    new TypeIt('#output', {
      strings: [htmlText],
      speed: 100,
      breakLines: true,
      loop: false
    }).go();
    
    if (outputText.split('').length < 100) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(outputText));
    }
  } catch (err) {
    output.textContent = "";
    const outputText ="Sorry, Please! Try Again Later";
    const htmlText = marked.parse(outputText);
    new TypeIt('#output', {
      strings: [htmlText],
      speed: 50,
      breakLines: false,
      loop: false
    }).go();
    console.error(err);
    if (outputText.split('').length < 100) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(outputText));
      }
  }
}

alertCloseBtn.addEventListener('click', () => {
  alertContainer.classList.remove('active');
});

function alert(message) {
  alertText.textContent = message;
  alertContainer.classList.add('active');
  setTimeout(() => {
    alertContainer.classList.remove('active');
  }, 5000);
}

/* Voice Input */
voiceBtn.addEventListener('click', () => {
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (typeof SpeechRecognition === 'undefined') {
  alert("Speech Recognition is not supported in this browser. Please use Google Chrome.");
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  voiceInputContainer.style.display = 'flex';
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    output(); 
  };

  recognition.onend = () => {
    voiceInputContainer.style.display = 'none';
  };

  recognition.onerror = (event) => {
    alert("Speech Recognition Error: " + event.error);
  };
}
});
  

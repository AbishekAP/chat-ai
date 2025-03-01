// DOM Elements
const input = document.getElementById("input");
const output = document.getElementById("output");
const enterBtn = document.getElementById("enter-btn");
const voiceBtn = document.getElementById("voice-btn");
const chatInputBox = document.getElementById("chat-input-box");
const voiceInputContainer = document.querySelector(".voice-input-container");
const alertContainer = document.querySelector(".alert-container");
const alertText = document.getElementById("alert-text");
const alertCloseBtn = document.querySelector(".btn-close");

chatInputBox.addEventListener("submit", (e) => {
  e.preventDefault();
  chat();
});

async function chat() {
  try {
    const message = input.value.trim();
    if (!message) {
      alert("Please enter a message!");
      return;
    }

    input.value = "";
    input.disabled = true;
    output.innerHTML = "Thinking...";

    const response = await fetch(config.API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const outputText =
      data?.choices?.[0]?.message?.content || "Sorry, something went wrong.";

    htmlText = marked.parse(outputText);

    new TypeIt("#output", {
      strings: [htmlText],
      speed: 10,
      breakLines: false,
      loop: false,
      cursor: false,
    }).go();

    if (outputText.length < 1000) {
      speechSynthesis.speak(
        new SpeechSynthesisUtterance(
          outputText.replace(
            /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
            ""
          )
        )
      );
    }
  } catch (err) {
    console.error(err);
    output.innerHTML = "Sorry, Please! Try Again Later";
  } finally {
    input.disabled = false;
  }
}

alertCloseBtn.addEventListener("click", () => {
  alertContainer.classList.remove("active");
});

function alert(message) {
  alertText.textContent = message;
  alertContainer.classList.add("active");
  clearTimeout(alert.timeout);
  alert.timeout = setTimeout(() => {
    alertContainer.classList.remove("active");
  }, 5000);
}

voiceBtn.addEventListener("click", () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Speech Recognition is not supported in this browser. Please use Google Chrome."
    );
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  voiceInputContainer.style.display = "flex";

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    chat(); // Automatically send the message
  };

  recognition.onend = () => {
    voiceInputContainer.style.display = "none";
  };

  recognition.onerror = (event) => {
    alert("Speech Recognition Error: " + event.error);
  };
});

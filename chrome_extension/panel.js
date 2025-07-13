(function () {
  if (document.getElementById("explainer-panel")) return;

  // Inject Font Awesome
  if (!document.getElementById("fontawesome-cdn")) {
    const link = document.createElement("link");
    link.id = "fontawesome-cdn";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
    document.head.appendChild(link);
  }

  // Create Panel
  const panel = document.createElement("div");
  panel.id = "explainer-panel";
  panel.innerHTML = `
    <div id="explainer-container">
      <div id="explainer-header">
        <span>AI Text Explainer</span>
        <button id="close-btn" title="Close"><i class="fas fa-xmark"></i></button>
      </div>
      <p id="status-msg"><i class="fas fa-info-circle"></i> Select text and click <strong>Explain</strong>.</p>
      <select id="voice-select" title="Choose voice"></select>
      <div class="btn-group">
        <button id="explain-btn" title="Explain"><i class="fas fa-wand-magic-sparkles"></i> Explain</button>
        <button id="play-pause-btn" title="Play or Pause"><i class="fas fa-play"></i> Play</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // Add Styles
  if (!document.getElementById("explainer-style")) {
    const style = document.createElement("style");
    style.id = "explainer-style";
    style.textContent = `
      #explainer-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 360px;
        padding: 20px;
        background: linear-gradient(135deg, #e3f2fd, #f9f9f9);
        backdrop-filter: blur(12px);
        border: 1px solid #d0e0f0;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        font-family: 'Segoe UI', Tahoma, sans-serif;
        color: #222;
        z-index: 999999;
        animation: fadeIn 0.3s ease-in-out;
      }

      #explainer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 18px;
        margin-bottom: 12px;
        color: #0d47a1;
      }

      #close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
      }
      #close-btn:hover {
        color: #e53935;
      }

      #status-msg {
        font-size: 14px;
        margin: 10px 0;
        color: #1e88e5;
      }

      #status-msg i {
        margin-right: 6px;
      }

      #voice-select {
        width: 100%;
        margin-bottom: 16px;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 14px;
        border: 1px solid #90caf9;
        background: #fff;
        outline: none;
        color: #0d47a1;
      }

      .btn-group {
        display: flex;
        gap: 10px;
      }

      .btn-group button {
        flex: 1;
        padding: 10px 14px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(to right, #42a5f5, #478ed1);
        color: white;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .btn-group button i {
        margin-right: 6px;
      }

      .btn-group button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 400px) {
        #explainer-panel {
          width: 92%;
          right: 4%;
          left: 4%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Logic
  const statusMsg = document.getElementById("status-msg");
  const voiceSelect = document.getElementById("voice-select");
  const playPauseBtn = document.getElementById("play-pause-btn");
  let utterance = new SpeechSynthesisUtterance();
  let isPaused = false;
  let currentVoice = null;

  function setStatus(message, color = "#1e88e5", icon = "info-circle") {
    statusMsg.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    statusMsg.style.color = color;
  }

  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    const preferredVoices = voices.filter(v =>
      ["Google UK English Male","Google UK English Female"].includes(v.name)
    );

    voiceSelect.innerHTML = "";
    preferredVoices.forEach((voice, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    currentVoice = preferredVoices[0] || null;
  }

  speechSynthesis.onvoiceschanged = populateVoices;
  populateVoices();

  voiceSelect.onchange = () => {
    const voices = speechSynthesis.getVoices();
    const preferredVoices = voices.filter(v =>
      ["Google UK English Male","Google UK English Female"].includes(v.name)
    );
    currentVoice = preferredVoices[voiceSelect.selectedIndex];
  };

  document.getElementById("explain-btn").onclick = () => {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) {
      setStatus("Please select some text first.", "#c62828", "exclamation-triangle");
      return;
    }

    speechSynthesis.cancel();
    setStatus("Generating explanation...", "#fb8c00", "spinner");

    fetch("http://localhost:5000/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText })
    })
      .then(res => res.json())
      .then(data => {
        utterance = new SpeechSynthesisUtterance(data.explanation);
        utterance.voice = currentVoice;
        speechSynthesis.speak(utterance);
        isPaused = false;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        setStatus("Explaining and reading aloud.", "#2e7d32", "volume-up");
      })
      .catch(err => {
        setStatus("Error: " + err.message, "#d32f2f", "times-circle");
      });
  };

  playPauseBtn.onclick = () => {
    if (speechSynthesis.speaking) {
      if (isPaused) {
        speechSynthesis.resume();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        setStatus("Resumed reading.", "#1565c0", "play");
        isPaused = false;
      } else {
        speechSynthesis.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        setStatus("Paused.", "#fbc02d", "pause");
        isPaused = true;
      }
    } else {
      setStatus("Nothing to speak yet.", "#757575", "question-circle");
    }
  };

  document.getElementById("close-btn").onclick = () => {
    speechSynthesis.cancel();
    panel.remove();
  };
})();

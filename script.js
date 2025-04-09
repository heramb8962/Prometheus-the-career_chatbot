let recognition;
let isSpeakingEnabled = false;
let isMicEnabled = false;
let lastBotResponse = "";
let speechUtterance;
let isReplaying = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("user-input").addEventListener("keypress", event => {
        if (event.key === "Enter") sendMessage();
    });
    document.getElementById("skill-gap-analyzer").addEventListener("click", toggleSkillAnalyzer);
    document.getElementById("analyze-button").addEventListener("click", analyzeSkills);
});

function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (message === "") return;

    const chatBox = document.getElementById("chat-messages");

    // Show user message
    const userDiv = document.createElement("div");
    userDiv.classList.add("chat-message");
    userDiv.style.color = "#9FE2BF"; // Customize user message color
    userDiv.textContent = message;
    chatBox.appendChild(userDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    userInput.value = "";

    // Placeholder typing animation
    const botDiv = document.createElement("div");
    botDiv.classList.add("chat-message", "typing");
    chatBox.appendChild(botDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Fetch response from backend
    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: message }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        lastBotResponse = data.response;
        startTypingAnimation(botDiv, lastBotResponse); // Typing animation
        if (isSpeakingEnabled) speakText(lastBotResponse);
    })
    .catch(() => {
        startTypingAnimation(botDiv, "Oops! Something went wrong.");
    });
}


function clearChat() {
    document.getElementById("chat-messages").innerHTML = "";
}

function toggleMicrophone() {
    let micButton = document.getElementById("mic-toggle");
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.onresult = event => {
            document.getElementById("user-input").value = event.results[0][0].transcript;
            sendMessage();
        };
        recognition.onend = () => {
            micButton.style.color = "";
            isMicEnabled = false;
        };
    }
    if (!isMicEnabled) {
        isMicEnabled = true;
        micButton.style.color = "red";
        recognition.start();
    }
}

function speakText(text, onComplete) {
    if (!text) return;
    window.speechSynthesis.cancel();
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = "en-US";
    speechUtterance.onend = () => { if (onComplete) onComplete(); };
    window.speechSynthesis.speak(speechUtterance);
}

function toggleSpeech() {
    let button = document.getElementById("speak-toggle");
    isSpeakingEnabled = !isSpeakingEnabled;
    button.classList.toggle("fa-volume-high");
    button.classList.toggle("fa-volume-xmark");
    button.style.color = isSpeakingEnabled ? "red" : "";
    if (!isSpeakingEnabled) window.speechSynthesis.cancel();
}

function replayLastResponse() {
    let replayIcon = document.getElementById("replay-speak");
    if (!lastBotResponse) return;
    if (isReplaying) {
        window.speechSynthesis.cancel();
        resetReplayIcon();
    } else {
        speakText(lastBotResponse, resetReplayIcon);
        replayIcon.classList.replace("fa-play", "fa-pause");
        isReplaying = true;
    }
}

function resetReplayIcon() {
    let replayIcon = document.getElementById("replay-speak");
    replayIcon.classList.replace("fa-pause", "fa-play");
    isReplaying = false;
}


// Typing animation function
function startTypingAnimation(element, text) {
    let index = 0;
    element.textContent = "";

    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
            element.classList.remove('typing');
        }
    }, 35); // Typing speed in ms
}

// Append a typing-style message to the chat box
function showTypingMessage(text) {
    const chatBox = document.getElementById("chat-messages");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", "typing");
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    startTypingAnimation(messageDiv, text);
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}
  
  // Skill Gap Analyzer Logic
function analyzeSkills() {
    const current = document.getElementById('currentSkills').value.toLowerCase();
    const goal = document.getElementById('goal').value.toLowerCase();
    const resultBox = document.getElementById('skillResult');
  
    if (!current || !goal) {
      resultBox.innerHTML = "Please fill both fields to analyze.";
      return;
    }
  
    // Very basic logic just for now (AI-style fake recommendation)
    let response = `<strong>Pathway from "${current}" to "${goal}":</strong><br><ul>`;
  
    if (goal.includes("full stack")) {
      response += "<li>Learn React or Angular for frontend</li>";
      response += "<li>Master Node.js or Django for backend</li>";
      response += "<li>Understand REST APIs and Databases (SQL/NoSQL)</li>";
      response += "<li>Build full-stack projects and host them on GitHub</li>";
    } else if (goal.includes("data scientist")) {
      response += "<li>Learn Python and libraries like Pandas, NumPy</li>";
      response += "<li>Master data visualization and EDA</li>";
      response += "<li>Study ML algorithms with Scikit-Learn</li>";
      response += "<li>Build ML projects and models</li>";
    } else {
      response += "<li>Research specific skills required for the goal</li>";
      response += "<li>Take online courses and build projects</li>";
      response += "<li>Connect with mentors or communities</li>";
    }
  
    response += "</ul>";
    resultBox.innerHTML = response;
}
  
function clearInputs() {
    document.getElementById('currentSkills').value = "";
    document.getElementById('goal').value = "";
    document.getElementById('skillResult').innerHTML = "";
}

// Open and close modal
function openJobTrendPopup() {
    document.getElementById("jobTrendModal").style.display = "block";
}
function closeJobTrendPopup() {
    document.getElementById("jobTrendModal").style.display = "none";
}
  
  // Show Chart
function showJobTrends() {
      const jobField = document.getElementById("jobFieldInput").value.trim();
      if (!jobField) {
          alert("Please enter a job field");
          return;
      }
  
      const years = Array.from({ length: 10 }, (_, i) => 2015 + i);
      const avgSalaries = years.map(() => Math.floor(Math.random() * 5 + 4) * 100000); // 4L–9L
      const topSalaries = years.map(() => Math.floor(Math.random() * 10 + 10) * 100000); // 10L–20L
  
      if (window.salaryChartInstance) {
          window.salaryChartInstance.destroy();
      }
  
      const ctx = document.getElementById('salaryChart').getContext('2d');
      window.salaryChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
              labels: years,
              datasets: [
                  {
                      label: 'Average Salary (₹)',
                      data: avgSalaries,
                      borderColor: '#00c0ff',
                      backgroundColor: 'rgba(0, 192, 255, 0.2)',
                      tension: 0.3
                  },
                  {
                      label: 'Top Salary (₹)',
                      data: topSalaries,
                      borderColor: '#ff5733',
                      backgroundColor: 'rgba(255, 87, 51, 0.2)',
                      tension: 0.3
                  }
              ]
          },
          options: {
              responsive: true,
              plugins: {
                  title: {
                      display: true,
                      text: `Salary Trends for "${jobField}" (Last 10 Years)`
                  }
              },
              scales: {
                  y: {
                      beginAtZero: true,
                      ticks: {
                          callback: value => `₹${(value / 100000).toFixed(1)}L`
                      }
                  }
              }
          }
      });
}
  
function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

document.getElementById("mental-health-btn").addEventListener("click", () => {
    document.getElementById("mentalHealthModal").style.display = "block";
});

function analyzeMentalHealth() {
    const mood = document.getElementById("userMood").value;
    const resultBox = document.getElementById("mentalHealthResult");

    if (!mood) {
        resultBox.innerHTML = "Please select a mood to proceed.";
        return;
    }

    let suggestions = "";

    switch (mood) {
        case "happy":
        case "amazing":
            suggestions = `
                <p>You're doing great! ✨</p>
                <ul>
                    <li>Try a creative writing prompt</li>
                    <li>Go for a walk or light workout</li>
                    <li>Listen to: <a href="https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0" target="_blank">Uplifting Playlist</a></li>
                </ul>`;
            break;
        case "sad":
            suggestions = `
                <p>It's okay to feel sad sometimes ❤️</p>
                <ul>
                    <li>Do 10 minutes of deep breathing or meditation</li>
                    <li>Watch a funny video or short movie</li>
                    <li>Listen to: <a href="https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0" target="_blank">Feel Good Music</a></li>
                </ul>`;
            break;
        case "excited":
            suggestions = `
                <p>Great energy! Let's channel it! 💪</p>
                <ul>
                    <li>Start a side project or hobby</li>
                    <li>Try a new creative workout</li>
                    <li>Listen to: <a href="https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP" target="_blank">Power Workout</a></li>
                </ul>`;
            break;
        case "other":
            suggestions = `
                <p>Feeling neutral or confused?</p>
                <ul>
                    <li>Write in a journal about your day</li>
                    <li>Stretch or do yoga for 15 minutes</li>
                    <li>Listen to: <a href="https://open.spotify.com/playlist/37i9dQZF1DWUvZBXGjNCU4" target="_blank">Peaceful Piano</a></li>
                </ul>`;
            break;
        default:
            suggestions = "Try selecting a mood again.";
    }

    resultBox.innerHTML = suggestions;
}

function openMentalHealthModal() {
      document.getElementById('mentalHealthModal').style.display = 'block';
}

function closeMentalHealthModal() {
      document.getElementById('mentalHealthModal').style.display = 'none';
      document.getElementById('userMood').value = '';
      document.getElementById('mentalHealthResult').innerHTML = '';
}

window.onclick = function(event) {
      const modal = document.getElementById('mentalHealthModal');
      if (event.target == modal) {
        closeMentalHealthModal();
      }
}

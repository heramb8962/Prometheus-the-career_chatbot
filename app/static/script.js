let recognition;
let isSpeakingEnabled = false;
let isMicEnabled = false;
let lastBotResponse = ""; // Store the last response
let speechUtterance; // Store current speech instance
let isReplaying = false; // Track replay state

function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    let chatMessages = document.getElementById("chat-messages");
    if (!userInput) return;
    chatMessages.innerHTML += `<div><strong>You:</strong> ${userInput}</div>`;
    
    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        lastBotResponse = data.response; // Store the last response
        chatMessages.innerHTML += `<div><strong>Bot:</strong> ${lastBotResponse}</div>`;
        document.getElementById("user-input").value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (isSpeakingEnabled) speakText(lastBotResponse);
    })
    .catch(() => chatMessages.innerHTML += `<div><strong>Bot:</strong> Error connecting to server.</div>`);
}

document.getElementById("user-input").addEventListener("keypress", event => {
    if (event.key === "Enter") sendMessage();
});

function clearChat() {
    document.getElementById("chat-messages").innerHTML = "";
}

// function toggleMicrophone() {
//     let micButton = document.getElementById("mic-toggle");
//     if (!recognition) {
//         recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognition.lang = 'en-US';
//         recognition.onresult = event => {
//             document.getElementById("user-input").value = event.results[0][0].transcript;
//             sendMessage();
//         };
//     }
//     isMicEnabled = !isMicEnabled;
//     micButton.classList.toggle("fa-microphone");
//     micButton.classList.toggle("fa-microphone-slash");
//     micButton.style.color = isMicEnabled ? "red" : "";
//     isMicEnabled ? recognition.start() : recognition.stop();
// }


function toggleMicrophone() {
    let micButton = document.getElementById("mic-toggle");

    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.continuous = false; // Stops when user stops speaking
        recognition.interimResults = false;

        recognition.onresult = event => {
            document.getElementById("user-input").value = event.results[0][0].transcript;
            sendMessage();
        };

        recognition.onend = () => {
            micButton.style.color = ""; // Reset color when recording stops
            isMicEnabled = false;
        };
    }

    if (!isMicEnabled) {
        isMicEnabled = true;
        micButton.style.color = "red"; // Change color to red when recording
        recognition.start();
    }
}



function speakText(text, onComplete) {
    if (!text) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = "en-US";

    // Once speaking is completed, reset the icon and tooltip
    speechUtterance.onend = () => {
        if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(speechUtterance);
}

function toggleSpeech() {
    let button = document.getElementById("speak-toggle");
    let tooltip = document.getElementById("speak-tooltip");

    isSpeakingEnabled = !isSpeakingEnabled;

    button.classList.toggle("fa-volume-high");
    button.classList.toggle("fa-volume-xmark");
    button.style.color = isSpeakingEnabled ? "red" : "";

    tooltip.innerText = isSpeakingEnabled ? "Disable Speak" : "Enable Speak";

    if (!isSpeakingEnabled) {
        window.speechSynthesis.cancel();  // Stop speaking immediately
    }
}

// Function to toggle replay
function replayLastResponse() {
    let replayIcon = document.getElementById("replay-speak");
    let replayTooltip = document.getElementById("replay-tooltip");

    if (!lastBotResponse) return; // If no response is stored, do nothing

    if (isReplaying) {
        // If currently speaking, stop it
        window.speechSynthesis.cancel();
        resetReplayIcon();
    } else {
        // If not speaking, start speaking from the beginning
        speakText(lastBotResponse, resetReplayIcon);
        replayIcon.classList.remove("fa-play");
        replayIcon.classList.add("fa-pause");
        replayIcon.classList.add("speaking");
        replayTooltip.innerText = "Stop Speaking";
        isReplaying = true;
    }
}

function resetReplayIcon() {
    let replayIcon = document.getElementById("replay-speak");
    let replayTooltip = document.getElementById("replay-tooltip");

    replayIcon.classList.remove("fa-pause", "speaking");
    replayIcon.classList.add("fa-play");
    replayTooltip.innerText = "Play Last Response";
    isReplaying = false;
}

document.addEventListener("DOMContentLoaded", function() {
    // Get all elements
    const skillGapButton = document.getElementById("skill-gap-analyzer");
    const skillInputContainer = document.getElementById("skill-input-container");
    const skillResults = document.getElementById("skill-results");
    const analyzeButton = document.getElementById("analyze-button");
    const interestInput = document.getElementById("interest");
    const currentSkillsInput = document.getElementById("current-skills");

    // Toggle skill input container
    skillGapButton.addEventListener("click", function() {
        if (skillInputContainer.style.display === "none" || !skillInputContainer.style.display) {
            skillInputContainer.style.display = "flex";
            skillResults.style.display = "none";
        } else {
            skillInputContainer.style.display = "none";
            skillResults.style.display = "none";
        }
    });

    // Analyze button functionality
    analyzeButton.addEventListener("click", function() {
        const interest = interestInput.value.trim();
        const currentSkills = currentSkillsInput.value.trim();

        if (!interest || !currentSkills) {
            alert("Please fill in both fields");
            return;
        }

        // Process skills (convert to array)
        const skillsArray = currentSkills.split(',').map(skill => skill.trim());

        // This is where you would normally make an API call
        // For demo, we'll simulate some results
        const trendingSkills = {
            "software development": ["JavaScript", "Python", "Cloud Computing", "DevOps"],
            "data science": ["Python", "Machine Learning", "Data Visualization", "SQL"],
            "cybersecurity": ["Network Security", "Ethical Hacking", "Risk Management", "Cryptography"]
        };

        // Get trending skills for the interest field
        const fieldTrendingSkills = trendingSkills[interest.toLowerCase()] || 
            ["AI", "Machine Learning", "Cloud Computing", "Problem Solving"];

        // Find lacking skills
        const lackingSkills = fieldTrendingSkills.filter(skill => 
            !skillsArray.some(userSkill => 
                userSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );

        // Display results
        skillResults.innerHTML = `
            <h3>Skill Gap Analysis Results</h3>
            <p><strong>Your Interest:</strong> ${interest}</p>
            <p><strong>Your Current Skills:</strong> ${skillsArray.join(', ')}</p>
            <hr>
            <p><strong>Trending Skills in ${interest}:</strong> ${fieldTrendingSkills.join(', ')}</p>
            <p><strong>Skills You Might Need:</strong> ${lackingSkills.length ? lackingSkills.join(', ') : "None! You're well-equipped!"}</p>
        `;

        skillResults.style.display = "block";
    });
});
// Add to your existing JavaScript
function toggleDashboard() {
    const dashboard = document.getElementById('job-dashboard');
    dashboard.classList.toggle('hidden');
}

async function fetchJobData() {
    const location = document.getElementById('job-location').value;
    const role = document.getElementById('job-role').value;
    
    // Show loading state
    document.getElementById('avg-salary').textContent = "Loading...";
    document.getElementById('job-count').textContent = "Loading...";
    
    try {
        // In production: Replace with actual API call
        // const response = await fetch(`/api/jobs?location=${location}&role=${role}`);
        // const data = await response.json();
        
        // Mock data - replace with real API integration
        const mockData = {
            'remote': {
                'software engineer': { avgSalary: '$125,000', jobs: '8,742', skills: ['React', 'AWS', 'Node.js'] },
                'data scientist': { avgSalary: '$115,000', jobs: '5,321', skills: ['Python', 'SQL', 'TensorFlow'] }
            },
            'new york': {
                'software engineer': { avgSalary: '$135,000', jobs: '3,421', skills: ['Java', 'Kubernetes', 'Spring'] },
                'data scientist': { avgSalary: '$120,000', jobs: '2,876', skills: ['R', 'PyTorch', 'BigQuery'] }
            }
        };
        
        const data = mockData[location][role.toLowerCase()];
        
        // Update UI
        document.getElementById('avg-salary').textContent = data.avgSalary;
        document.getElementById('job-count').textContent = data.jobs;
        
        // Render skills chart (simplified - use Chart.js in production)
        document.getElementById('skills-chart').innerHTML = `
            <h4>Top Skills:</h4>
            <ul>
                ${data.skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>
        `;
        
    } catch (error) {
        console.error("Error fetching job data:", error);
        document.getElementById('avg-salary').textContent = "Error";
        document.getElementById('job-count').textContent = "Error";
    }
}

// Mental Health Functions
function toggleMentalHealth() {
    const dashboard = document.getElementById('mental-health-dashboard');
    dashboard.classList.toggle('hidden');
    if (!dashboard.classList.contains('hidden')) {
        document.getElementById('mental-health-results').innerHTML = '';
    }
}

async function checkMentalHealth(mood) {
    const resultsDiv = document.getElementById('mental-health-results');
    resultsDiv.innerHTML = `
        <div style="text-align: center;">
            <div class="loading-spinner"></div>
            <p>Analyzing your mood...</p>
        </div>
    `;

    try {
        // Get health tip from government API
        const healthResponse = await fetch('https://health.gov/myhealthfinder/api/v3/topicsearch.json?categoryId=20');
        const healthData = await healthResponse.json();
        
        // Get motivational quote
        const quoteResponse = await fetch('https://api.quotable.io/random?tags=motivational');
        const quoteData = await quoteResponse.json();

        // Local fallback tips
        const localTips = {
            happy: "Keep this positive energy flowing! Consider journaling about what's making you happy today.",
            neutral: "Try a quick 5-minute mindfulness exercise to give your mood a gentle boost.",
            stressed: "Practice the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7, exhale for 8.",
            anxious: "Use the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
        };

        // Display results
        resultsDiv.innerHTML = `
            <div class="mental-health-tip">
                <h4><i class="fas fa-lightbulb"></i> For Your ${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood</h4>
                <p>${healthData.Result.Resources.Resource[0]?.MyHFDescription || localTips[mood]}</p>
            </div>
            <div class="mental-health-tip">
                <h4><i class="fas fa-quote-left"></i> Motivational Quote</h4>
                <p>"${quoteData.content}" - ${quoteData.author}</p>
            </div>
            <div class="mental-health-tip">
                <h4><i class="fas fa-headphones"></i> Relaxation Tool</h4>
                <button onclick="playCalmingAudio()" class="audio-btn">
                    <i class="fas fa-play"></i> Play Calming Rain Sounds
                </button>
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="mental-health-tip">
                <h4><i class="fas fa-exclamation-triangle"></i> Connection Issue</h4>
                <p>Here's a tip for your ${mood} mood:</p>
                <p>${getFallbackTip(mood)}</p>
            </div>
        `;
    }
}

function getFallbackTip(mood) {
    const tips = {
        happy: "Continue your positive streak by sharing your happiness with someone today!",
        neutral: "Take a 10-minute walk outside to refresh your perspective.",
        stressed: "Try progressive muscle relaxation: Tense and release each muscle group from toes to head.",
        anxious: "Sip warm tea slowly while focusing on the sensation and aroma."
    };
    return tips[mood];
}

function playCalmingAudio() {
    // Using a free rain sound from YouTube's audio library
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    audio.play();
    
    // Update button state
    const btn = document.querySelector('.audio-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-pause"></i> Playing... (Click to stop)';
        btn.onclick = function() {
            audio.pause();
            btn.innerHTML = '<i class="fas fa-play"></i> Play Calming Rain Sounds';
            btn.onclick = playCalmingAudio;
        };
    }
}

// Initialize mood buttons
function initMentalHealth() {
    document.querySelectorAll('.mood-options button').forEach(btn => {
        btn.addEventListener('click', function() {
            checkMentalHealth(this.dataset.mood);
        });
    });
}
// Initialize with default data
document.addEventListener('DOMContentLoaded', fetchJobData);

async function fetchRealJobData() {
    try {
        const response = await fetch('https://api.linkedin.com/v2/jobs', {
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
            }
        });
        
        // Initialize mental health components
        document.getElementById('mental-health-btn').addEventListener('click', toggleMentalHealth);
        initMentalHealth();
        
        // Process the response data here
        const data = await response.json();
        console.log(data);
        
    } catch (error) {
        console.error('Error fetching job data:', error);
    }
}
    // Process real data...
// Add these NEW functions (keep all your existing code)

let jobTrendsChart;

function toggleJobTrends() {
    const dashboard = document.getElementById('job-trends-dashboard');
    dashboard.classList.toggle('hidden');
    
    if (!dashboard.classList.contains('hidden')) {
        loadJobTrends();
    } else if (jobTrendsChart) {
        jobTrendsChart.destroy();
    }
}

async function loadJobTrends() {
    // 1. Show loading state
    document.getElementById('trends-content').innerHTML = '<p>Loading data...</p>';
    
    // 2. Fetch data (mock version - replace with real API)
    const mockData = await fetchMockJobData();
    
    // 3. Render UI
    renderTrendsUI(mockData);
}

function fetchMockJobData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                avgSalary: 125000,
                growthRate: "12%",
                trendingSkills: ["AI", "Cloud Security", "Data Engineering"],
                trendData: [120, 125, 130, 128, 135, 140] // 6 months data
            });
        }, 800); // Simulate API delay
    });
}

function renderTrendsUI(data) {
    const content = `
        <div class="trend-metric">
            <h4>Average Salary</h4>
            <p>$${data.avgSalary.toLocaleString()}</p>
        </div>
        <div class="trend-metric">
            <h4>Yearly Growth</h4>
            <p>${data.growthRate}</p>
        </div>
        <div class="trend-metric">
            <h4>Top Skills</h4>
            <p>${data.trendingSkills.join(', ')}</p>
        </div>
        <canvas id="trends-chart"></canvas>
    `;
    
    document.getElementById('trends-content').innerHTML = content;
    renderTrendChart(data.trendData);
}

function renderTrendChart(dataPoints) {
    const ctx = document.getElementById('trends-chart').getContext('2d');
    
    if (jobTrendsChart) jobTrendsChart.destroy();
    
    jobTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Job Postings Trend',
                data: dataPoints,
                borderColor: '#4F959D',
                backgroundColor: 'rgba(79, 149, 157, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Initialize (add to your existing DOMContentLoaded)
document.getElementById('job-trends-btn').addEventListener('click', toggleJobTrends);

// Mental Health Functions
function toggleMentalHealth() {
    const dashboard = document.getElementById('mental-health-dashboard');
    dashboard.classList.toggle('hidden');
    if (!dashboard.classList.contains('hidden')) {
        document.getElementById('mental-health-results').innerHTML = '';
    }
}

async function checkMentalHealth(mood) {
    const resultsDiv = document.getElementById('mental-health-results');
    resultsDiv.innerHTML = '<div class="loading">Analyzing your mood...</div>';

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with real API calls
        const tips = {
            happy: "Keep this positive energy flowing! Consider journaling about what's making you happy today.",
            neutral: "Try a quick 5-minute mindfulness exercise to give your mood a gentle boost.",
            stressed: "Practice the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7, exhale for 8.",
            anxious: "Use the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
        };

        const quotes = {
            happy: "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
            neutral: "Peace begins with a smile. - Mother Teresa",
            stressed: "You don't have to control your thoughts. You just have to stop letting them control you. - Dan Millman",
            anxious: "Anxiety does not empty tomorrow of its sorrows, but only empties today of its strength. - Charles Spurgeon"
        };

        resultsDiv.innerHTML = `
            <div class="mental-health-tip">
                <h4>For Your ${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood</h4>
                <p>${tips[mood]}</p>
            </div>
            <div class="mental-health-tip">
                <h4>Inspiration</h4>
                <p>${quotes[mood]}</p>
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="error">
                <p>Connection error. Here's a tip for ${mood}:</p>
                <p>${getFallbackTip(mood)}</p>
            </div>
        `;
    }
}

function initMentalHealth() {
    document.querySelectorAll('.mood-options button').forEach(btn => {
        btn.addEventListener('click', function() {
            checkMentalHealth(this.dataset.mood);
        });
    });
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('mental-health-btn').addEventListener('click', toggleMentalHealth);
    initMentalHealth();
});
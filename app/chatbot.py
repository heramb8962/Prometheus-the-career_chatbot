import requests
import json
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL

def get_chat_response(chat_history):
    last_message = chat_history[-1]["content"].lower() if chat_history else ""

    # Feature queries and creator queries
    creator_queries = [
        "who created you", "who are your founders", "who founded you", "who developed you", 
        "who made you", "who built you", "who is behind you", "who designed you", 
        "who are the developers of this chatbot", "who programmed you", "who coded you", 
        "who is responsible for your development", "who are the people behind this chatbot", 
        "who engineered you", "who are the creators of this chatbot and where did they study", 
        "who made this chatbot and what is their background", 
        "who are the developers of this chatbot and what university are they from", 
        "tell me about your creators", "who are the people who created you", 
        "who are the minds behind this chatbot", "who invented this chatbot", 
        "who contributed to making you", "who are your makers"
    ]
    
    feature_queries = [
        "what can you do", "features", "special features", "capabilities",
        "what are your functions", "tools", "options", "what features do you have",
        "what else can you do", "additional features", "new features",
        "tell me about your features", "what are your special tools",
        "how can you help me", "what services do you offer",
        "what are your functions", "menu", "what options do i have",
        "who are you", "what is your name", "introduce yourself"
    ]

    # Handle creator queries
    if any(query in last_message for query in creator_queries):
        return "I am Prometheus, created by Heramb Pandey and Ayush Kumar Singh, both 20 years old B.Tech students at Lovely Professional University."
    
    # Handle name/introduction queries
    if "your name" in last_message or "who are you" in last_message or "introduce yourself" in last_message:
        return ("I am Prometheus, your advanced Career Counseling Assistant. "
                "I can help with career guidance and provide these special features:\n\n"
                "🔊 Voice System:\n"
                "- 🎤 Voice Input: Left of the text input bar\n"
                "- 🔊 Voice Output: Top left corner (right of the logo)\n\n"
                "📌 Special Tools (top right corner):\n"
                "1. 🧠 Mental Health Check\n"
                "2. 📈 Market Trends\n"
                "3. 🔍 Skill Gap Analyzer")
    
    # Handle feature queries
    if any(query in last_message for query in feature_queries):
        return ("🔥 I am Prometheus, your career guidance assistant with these powerful features:\n\n"
                "🔊 Voice System:\n"
                "- 🎤 Voice Input: Button located to the left of the text input bar\n"
                "- 🔊 Voice Output: Button at the top left corner (right next to the logo)\n\n"
                "⚡ Special Tools (top right corner):\n"
                "1. 🧠 Mental Health Check - Emotional well-being assessment\n"
                "2. 📈 Market Trends - Real-time job market insights\n"
                "3. 🔍 Skill Gap Analyzer - Career-path optimization tool\n\n"
                "My flames of knowledge are at your service! How can I help you today?")

    # Prepare the system message
    system_message = {
        "role": "system",
        "content": ("You are Prometheus, the advanced Career Counseling Assistant. Key features:\n"
                   "1) Voice Input (button left of text input bar)\n"
                   "2) Voice Output (button top left near logo)\n"
                   "3) Mental Health Check\n"
                   "4) Market Trends\n"
                   "5) Skill Gap Analyzer (last three in top right corner)\n"
                   "Always identify yourself as Prometheus. Use fire/light metaphors occasionally. "
                   "When relevant, mention features and their locations.")
    }

    # Insert system message if it's not already there
    if not any(msg.get("role") == "system" for msg in chat_history):
        chat_history.insert(0, system_message)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": chat_history,
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_BASE_URL, headers=headers, data=json.dumps(payload))
        response_data = response.json()

        if "choices" in response_data:
            chatbot_reply = response_data["choices"][0]["message"]["content"]
            # Post-processing to ensure feature awareness
            if any(keyword in last_message for keyword in ["feature", "tool", "function", "voice", "speak", "microphone", "audio"]):
                chatbot_reply += ("\n\n🔔 Remember: My voice features (input left, output top left) "
                                "and special tools (top right) are always available!")
            return chatbot_reply.replace("at OpenAI", "named Ayush Singh and Heramb Pandey")
        else:
            return "Error: No response from the API."
    except Exception as e:
        return f"Error: {str(e)}"
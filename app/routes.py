from flask import Blueprint, request, jsonify, render_template, session
from .chatbot import get_chat_response

main = Blueprint('main', __name__)

@main.route("/")
def index():
    return render_template("index.html")

@main.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("message")

    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    if "chat_history" not in session or not isinstance(session["chat_history"], list):
        session["chat_history"] = []

    session["chat_history"].append({"role": "user", "content": user_input})

    bot_response = get_chat_response(session["chat_history"])  

    session["chat_history"].append({"role": "assistant", "content": bot_response})

    return jsonify({"response": bot_response})
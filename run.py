from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This allows frontend requests from a different domain

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    return jsonify({"response": f"You said: {user_input}"})

if __name__ == "__main__":
    app.run(debug=True)

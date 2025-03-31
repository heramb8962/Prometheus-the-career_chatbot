from flask import Flask
from flask_session import Session

def create_app():
    app = Flask(__name__)

    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SECRET_KEY"] = "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"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_FILE_DIR"] = "./flask_session"

    Session(app)
    return app

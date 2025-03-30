from flask import Flask
from flask_session import Session

def create_app():
    app = Flask(__name__)

    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SECRET_KEY"] = "your_secret_key"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_FILE_DIR"] = "./flask_session"

    Session(app)
    return app
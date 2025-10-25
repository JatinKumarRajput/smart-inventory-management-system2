# app/__init__.py

from flask import Flask
from flask_cors import CORS
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from dotenv import load_dotenv
import os

load_dotenv()

bcrypt = Bcrypt()
login_manager = LoginManager()
mysql = MySQL()  # Create globally here

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
    app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
    app.config['MYSQL_USER'] = os.getenv('DB_USER')
    app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
    app.config['MYSQL_DB'] = os.getenv('DB_NAME')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # ADD THESE SESSION CONFIGS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    mysql.init_app(app)  # Initialize mysql with app

    return app



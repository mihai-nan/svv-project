from flask import Flask, session
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.config.from_object(Config)
app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'
db = SQLAlchemy(app)
migrate = Migrate(app, db)


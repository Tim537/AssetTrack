import os

from flask import Flask, jsonify
from flask_cors import CORS
from db import db
from routes.auth import auth_bp
from routes.organization import org_bp
from routes.asset import asset_bp
from flask_jwt_extended import JWTManager
from datetime import timedelta
from pathlib import Path

app = Flask(__name__)

cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]
CORS(app, resources={r"/api/*": {"origins": cors_origins}})

instance_path = Path(__file__).parent / 'instance'
instance_path.mkdir(exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{instance_path / "assettrack.db"}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-only-change-me')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'query_string']
app.config['JWT_QUERY_STRING_NAME'] = 'token'

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(org_bp, url_prefix='/api/organization')
app.register_blueprint(asset_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200


# Ensure tables exist when running under gunicorn.
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    debug = os.getenv("FLASK_DEBUG", "0") in ("1", "true", "True")
    app.run(debug=debug, port=5000, host='0.0.0.0')

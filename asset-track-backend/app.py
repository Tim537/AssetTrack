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
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

instance_path = Path(__file__).parent / 'instance'
instance_path.mkdir(exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{instance_path / "assettrack.db"}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

app.config['JWT_SECRET_KEY'] = 'super-secret-dev-key-change-this' 
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000, host='0.0.0.0')

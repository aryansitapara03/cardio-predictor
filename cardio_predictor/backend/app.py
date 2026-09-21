from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

with open('cardio_model.pkl', 'rb') as f:
    loaded_data = pickle.load(f)
    model = loaded_data['model']
    model_accuracy = loaded_data.get('accuracy', 72.84)

MODELS_BENCHMARK = [
    {"name": "Gradient Boosting", "accuracy": 73.01, "precision": 75.17, "recall": 68.23, "f1": 71.53, "is_best": True, "speed": "12ms"},
    {"name": "Random Forest", "accuracy": 72.70, "precision": 75.55, "recall": 66.63, "f1": 70.81, "speed": "18ms"},
    {"name": "Logistic Regression", "accuracy": 72.39, "precision": 75.18, "recall": 66.35, "f1": 70.49, "speed": "5ms"},
    {"name": "Scratch Logistic Reg", "accuracy": 72.49, "precision": 75.25, "recall": 66.51, "f1": 70.61, "speed": "8ms"},
    {"name": "Extra Trees", "accuracy": 72.51, "precision": 74.82, "recall": 67.35, "f1": 70.89, "speed": "22ms"},
    {"name": "AdaBoost", "accuracy": 72.49, "precision": 76.40, "recall": 64.59, "f1": 70.00, "speed": "15ms"},
    {"name": "Decision Tree", "accuracy": 71.95, "precision": 73.96, "recall": 67.21, "f1": 70.43, "speed": "4ms"},
    {"name": "Naive Bayes", "accuracy": 70.57, "precision": 75.75, "recall": 59.98, "f1": 66.95, "speed": "3ms"}
]

@app.route('/api/models', methods=['GET'])
@app.route('/models', methods=['GET'])
def get_models():
    return jsonify({
        'success': True,
        'models': MODELS_BENCHMARK,
        'best_model': 'Gradient Boosting'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        features = [
            float(data.get('age', 0)),
            float(data.get('gender', 1)),
            float(data.get('height', 165)),
            float(data.get('weight', 70)),
            float(data.get('ap_hi', 120)),
            float(data.get('ap_lo', 80)),
            float(data.get('cholesterol', 1)),
            float(data.get('gluc', 1)),
            float(data.get('smoke', 0)),
            float(data.get('alco', 0)),
            float(data.get('active', 1))
        ]

        input_array = np.array([features])
        prob = model.predict_proba(input_array)[0][1]  
        risk_score = round(float(prob * 100), 1)

        factors = []
        if features[4] >= 130 or features[5] >= 80:
            factors.append(f"High Blood Pressure ({int(features[4])}/{int(features[5])} mmHg)")
        if features[6] > 1:
            factors.append(f"High Cholesterol (Level {int(features[6])})")
        if features[7] > 1:
            factors.append(f"High Blood Glucose / Sugar (Level {int(features[7])})")
        
        height_m = features[2] / 100.0
        bmi = round(features[3] / (height_m * height_m), 1) if height_m > 0 else 0
        if bmi >= 25:
            factors.append(f"High BMI ({bmi} kg/m²)")
        if features[0] >= 55:
            factors.append(f"Age above 55 Years ({int(features[0])} Yrs)")
        if features[8] == 1:
            factors.append("Smoking Habit")
        if features[9] == 1:
            factors.append("Alcohol Usage")
        if features[10] == 0:
            factors.append("No Physical Exercise")

        return jsonify({
            'success': True,
            'risk_percentage': risk_score,
            'is_high_risk': risk_score >= 50,
            'status': 'POSITIVE (High Risk)' if risk_score >= 50 else 'NEGATIVE (Low Risk)',
            'risk_factors': factors,
            'model_accuracy': model_accuracy
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
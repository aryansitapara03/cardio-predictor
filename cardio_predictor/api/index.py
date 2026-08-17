import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

# ૧. ટ્રેન થયેલું મોડેલ લોડ કરો (સંકલિત પથ સાથે)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'cardio_model.pkl')

try:
    with open(MODEL_PATH, 'rb') as f:
        loaded_data = pickle.load(f)
        model = loaded_data['model']
        model_accuracy = loaded_data.get('accuracy', 72.84)
except Exception as e:
    model = None
    model_accuracy = 72.84
    print(f"Error loading model: {e}")

@app.route('/api/predict', methods=['POST'])
@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'success': False, 'error': 'Model file not loaded properly'}), 500

        data = request.get_json() or {}

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

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

print("=" * 65)
print("1. Loading 70,000 Dataset...")
df = pd.read_csv('cardio_train.csv', sep=';')

# ૧. ઉંમરને દિવસોમાંથી વર્ષોમાં કન્વર્ટ કરો
if df['age'].max() > 1000:
    df['age'] = (df['age'] / 365.25).round().astype(int)

# ૨. આઉટલાયર્સ (Outliers) સાફ કરો
initial_count = len(df)
df = df[(df['ap_hi'] >= 70) & (df['ap_hi'] <= 220)]     # BP Systolic Filter
df = df[(df['ap_lo'] >= 40) & (df['ap_lo'] <= 140)]     # BP Diastolic Filter
df = df[df['ap_hi'] >= df['ap_lo']]                     # Upper BP >= Lower BP
df = df[(df['height'] >= 120) & (df['height'] <= 220)]  # Height Filter
df = df[(df['weight'] >= 35) & (df['weight'] <= 180)]   # Weight Filter

print(f"-> Removed {initial_count - len(df)} outlier records. Clean records: {len(df)}")

# ૩. Features (X) અને Target (y)
features = ['age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active']
X = df[features]
y = df['cardio']

# ડેટા સ્પ્લિટ (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ૪. મોડેલ ટ્રેનિંગ
print("2. Training Logistic Regression Model...")
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# ૫. Accuracy ગણતરી
y_pred = model.predict(X_test)
accuracy = round(float(accuracy_score(y_test, y_pred) * 100), 2)

# ૬. CMD માં Weights પ્રિન્ટ કરો
print("=" * 65)
print(f"🎯 MODEL ACCURACY: {accuracy}%")
print("=" * 65)
print("FEATURE WEIGHTS (COEFFICIENTS) FOR LOGISTIC REGRESSION:")
print(f"{'Feature Name':<20} | {'Weight (Coefficient)':<25}")
print("-" * 55)
for feature_name, weight in zip(features, model.coef_[0]):
    print(f"{feature_name:<20} | {weight:+.6f}")
print("-" * 55)
print(f"{'Intercept (Bias)':<20} | {model.intercept_[0]:+.6f}")
print("=" * 65)

model_data = {
    'model': model,
    'accuracy': accuracy,
    'features': features
}

with open('cardio_model.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("✅ 'cardio_model.pkl' સફળતાપૂર્વક બની ગયું છે!")
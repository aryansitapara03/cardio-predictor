import pandas as pd
import numpy as np
import pickle
import time
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier

def main():
    print("=" * 80)
    print("CARDIO PREDICTOR - HYPERPARAMETER TUNING (GridSearchCV & RandomizedSearchCV)")
    print("=" * 80)

    # 1. Load and clean dataset
    print("\n1. Loading and Cleaning Cardio Dataset...")
    df = pd.read_csv('cardio_train.csv', sep=';')

    if df['age'].max() > 1000:
        df['age'] = (df['age'] / 365.25).round().astype(int)

    initial_count = len(df)
    df = df[(df['ap_hi'] >= 70) & (df['ap_hi'] <= 220)]    
    df = df[(df['ap_lo'] >= 40) & (df['ap_lo'] <= 140)]    
    df = df[df['ap_hi'] >= df['ap_lo']]                     
    df = df[(df['height'] >= 120) & (df['height'] <= 220)]  
    df = df[(df['weight'] >= 35) & (df['weight'] <= 180)] 

    print(f"-> Outliers removed: {initial_count - len(df)}. Clean records: {len(df)}")

    features = ['age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active']
    X = df[features]
    y = df['cardio']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 2. Baseline Model Evaluation
    print("\n2. Evaluating Baseline Model (Gradient Boosting)...")
    baseline_gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, max_depth=3, random_state=42)
    baseline_gb.fit(X_train, y_train)

    y_train_base = baseline_gb.predict(X_train)
    y_test_base = baseline_gb.predict(X_test)
    base_train_acc = round(float(accuracy_score(y_train, y_train_base) * 100), 2)
    base_test_acc = round(float(accuracy_score(y_test, y_test_base) * 100), 2)
    base_f1 = round(float(f1_score(y_test, y_test_base) * 100), 2)
    print(f"-> Baseline Gradient Boosting | Train Acc: {base_train_acc}% | Test Acc: {base_test_acc}% | F1: {base_f1}%")

    # 3. GridSearchCV Tuning
    print("\n" + "=" * 80)
    print("3. Executing GridSearchCV Tuning...")
    print("=" * 80)

    grid_param_grid = {
        'n_estimators': [50, 100, 150],
        'max_depth': [3, 5, 8],
        'learning_rate': [0.03, 0.05, 0.1],
        'subsample': [0.8, 1.0]
    }

    gb_for_grid = GradientBoostingClassifier(random_state=42)
    grid_search = GridSearchCV(
        estimator=gb_for_grid,
        param_grid=grid_param_grid,
        cv=5,
        scoring='accuracy',
        n_jobs=-1,
        verbose=1
    )

    t0 = time.time()
    grid_search.fit(X_train, y_train)
    grid_time = round(time.time() - t0, 2)

    print(f"\n[GridSearchCV Complete in {grid_time}s]")
    print(f"-> Best Parameters Found by GridSearchCV: {grid_search.best_params_}")
    print(f"-> Best Cross-Validation Score: {round(grid_search.best_score_ * 100, 2)}%")

    best_grid_model = grid_search.best_estimator_
    y_train_grid = best_grid_model.predict(X_train)
    y_test_grid = best_grid_model.predict(X_test)

    grid_train_acc = round(float(accuracy_score(y_train, y_train_grid) * 100), 2)
    grid_test_acc = round(float(accuracy_score(y_test, y_test_grid) * 100), 2)
    grid_prec = round(float(precision_score(y_test, y_test_grid) * 100), 2)
    grid_rec = round(float(recall_score(y_test, y_test_grid) * 100), 2)
    grid_f1 = round(float(f1_score(y_test, y_test_grid) * 100), 2)

    # 4. RandomizedSearchCV Tuning
    print("\n" + "=" * 80)
    print("4. Executing RandomizedSearchCV Tuning...")
    print("=" * 80)

    rand_param_dist = {
        'n_estimators': [50, 75, 100, 125, 150, 200],
        'max_depth': [3, 4, 5, 6, 7, 8],
        'learning_rate': [0.01, 0.03, 0.05, 0.08, 0.1, 0.15],
        'subsample': [0.7, 0.8, 0.9, 1.0],
        'min_samples_split': [2, 5, 10]
    }

    gb_for_rand = GradientBoostingClassifier(random_state=42)
    rand_search = RandomizedSearchCV(
        estimator=gb_for_rand,
        param_distributions=rand_param_dist,
        n_iter=15,
        cv=5,
        scoring='accuracy',
        random_state=42,
        n_jobs=-1,
        verbose=1
    )

    t0 = time.time()
    rand_search.fit(X_train, y_train)
    rand_time = round(time.time() - t0, 2)

    print(f"\n[RandomizedSearchCV Complete in {rand_time}s]")
    print(f"-> Best Parameters Found by RandomizedSearchCV: {rand_search.best_params_}")
    print(f"-> Best Cross-Validation Score: {round(rand_search.best_score_ * 100, 2)}%")

    best_rand_model = rand_search.best_estimator_
    y_train_rand = best_rand_model.predict(X_train)
    y_test_rand = best_rand_model.predict(X_test)

    rand_train_acc = round(float(accuracy_score(y_train, y_train_rand) * 100), 2)
    rand_test_acc = round(float(accuracy_score(y_test, y_test_rand) * 100), 2)
    rand_prec = round(float(precision_score(y_test, y_test_rand) * 100), 2)
    rand_rec = round(float(recall_score(y_test, y_test_rand) * 100), 2)
    rand_f1 = round(float(f1_score(y_test, y_test_rand) * 100), 2)

    # 5. Performance Comparison & Summary Table
    print("\n" + "=" * 90)
    print("5. HYPERPARAMETER TUNING RESULTS & SCORE COMPARISON")
    print("=" * 90)
    print(f"{'Method / Model':<26} | {'Train Acc':<10} | {'Test Acc':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("-" * 90)
    print(f"{'Baseline Gradient Boosting':<26} | {base_train_acc:<9}% | {base_test_acc:<9}% | {'N/A':<10} | {'N/A':<10} | {base_f1:<9}%")
    print(f"{'GridSearchCV Tuned':<26} | {grid_train_acc:<9}% | {grid_test_acc:<9}% | {grid_prec:<9}% | {grid_rec:<9}% | {grid_f1:<9}%")
    print(f"{'RandomizedSearchCV Tuned':<26} | {rand_train_acc:<9}% | {rand_test_acc:<9}% | {rand_prec:<9}% | {rand_rec:<9}% | {rand_f1:<9}%")
    print("=" * 90)

    # Determine winning tuned model
    if grid_test_acc >= rand_test_acc:
        winning_name = "GridSearchCV Tuned Model"
        winning_model = best_grid_model
        winning_acc = grid_test_acc
        winning_params = grid_search.best_params_
    else:
        winning_name = "RandomizedSearchCV Tuned Model"
        winning_model = best_rand_model
        winning_acc = rand_test_acc
        winning_params = rand_search.best_params_

    diff_improvement = round(winning_acc - base_test_acc, 2)
    print(f"\nWINNER: {winning_name} with Test Accuracy of {winning_acc}%!")
    print(f"Improvement over baseline: +{diff_improvement}% accuracy difference.")
    print(f"Optimal Parameters: {winning_params}")

if __name__ == '__main__':
    main()

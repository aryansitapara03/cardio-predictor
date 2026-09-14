import pandas as pd
import numpy as np
import pickle
import os
import shutil
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, ExtraTreesClassifier
from sklearn.naive_bayes import GaussianNB

class ScratchLogisticRegression:
    def __init__(self, lr=0.01, num_iter=1000):
        self.lr = lr
        self.num_iter = num_iter
        self.weights = None
        self.bias = None
        self.mean = None
        self.std = None

    def _sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -250, 250)))

    def fit(self, X, y):
        X_arr = np.array(X, dtype=np.float64)
        self.mean = np.mean(X_arr, axis=0)
        self.std = np.std(X_arr, axis=0)
        self.std[self.std == 0] = 1.0
        X_scaled = (X_arr - self.mean) / self.std

        n_samples, n_features = X_scaled.shape
        self.weights = np.zeros(n_features)
        self.bias = 0.0

        for _ in range(self.num_iter):
            linear_model = np.dot(X_scaled, self.weights) + self.bias
            y_predicted = self._sigmoid(linear_model)

            dw = (1 / n_samples) * np.dot(X_scaled.T, (y_predicted - y))
            db = (1 / n_samples) * np.sum(y_predicted - y)

            self.weights -= self.lr * dw
            self.bias -= self.lr * db

    def predict_proba(self, X):
        X_arr = np.array(X, dtype=np.float64)
        X_scaled = (X_arr - self.mean) / self.std
        linear_model = np.dot(X_scaled, self.weights) + self.bias
        prob = self._sigmoid(linear_model)
        return np.column_stack((1 - prob, prob))

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)


def run_training():
    print("=" * 80)
    print("1. Loading 70,000 Cardio Dataset...")
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

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Scratch Logistic Reg": ScratchLogisticRegression(lr=0.05, num_iter=1500),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.05, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=42),
        "AdaBoost": AdaBoostClassifier(n_estimators=50, random_state=42),
        "Extra Trees": ExtraTreesClassifier(n_estimators=100, max_depth=10, random_state=42),
        "Naive Bayes": GaussianNB()
    }

    saved_models_dict = {}

    print("\n2. Training & Evaluating Baseline Machine Learning Models...\n")
    print(f"{'Model Key':<22} | {'Train Acc':<10} | {'Test Acc':<10} | {'Gap (Diff)':<10} | {'Status':<18}")
    print("-" * 80)

    for name, model in models.items():
        model.fit(X_train, y_train)
        
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        train_acc = round(float(accuracy_score(y_train, y_train_pred) * 100), 2)
        test_acc = round(float(accuracy_score(y_test, y_test_pred) * 100), 2)
        gap = round(train_acc - test_acc, 2)
        
        prec = round(float(precision_score(y_test, y_test_pred, zero_division=0) * 100), 2)
        rec = round(float(recall_score(y_test, y_test_pred, zero_division=0) * 100), 2)
        f1 = round(float(f1_score(y_test, y_test_pred, zero_division=0) * 100), 2)
        
        if gap > 5.0:
            status = "Overfitting"
        elif train_acc < 65.0 or test_acc < 65.0:
            status = "Underfitting"
        elif abs(gap) <= 2.0:
            status = "Good Fit (Optimal)"
        else:
            status = "Slight Overfit"
        
        print(f"{name:<22} | {train_acc:<9}% | {test_acc:<9}% | {gap:<9}% | {status:<18}")

        saved_models_dict[name] = {
            'model': model,
            'accuracy': test_acc,
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'fit_status': status,
            'precision': prec,
            'recall': rec,
            'f1': f1,
            'is_scratch': isinstance(model, ScratchLogisticRegression)
        }

    # 3. Hyperparameter Tuning using BOTH GridSearchCV and RandomizedSearchCV
    print("\n" + "=" * 80)
    print("3. Executing Hyperparameter Tuning on Best Model (Gradient Boosting)...")
    print("=" * 80)

    # 3A. GridSearchCV
    print("\n--> Running GridSearchCV...")
    grid_param_grid = {
        'n_estimators': [50, 100, 150],
        'max_depth': [3, 5, 8],
        'learning_rate': [0.03, 0.05, 0.1],
        'subsample': [0.8, 1.0]
    }
    grid_search = GridSearchCV(
        estimator=GradientBoostingClassifier(random_state=42),
        param_grid=grid_param_grid,
        cv=5,
        scoring='accuracy',
        n_jobs=-1
    )
    grid_search.fit(X_train, y_train)

    best_grid_model = grid_search.best_estimator_
    y_train_grid = best_grid_model.predict(X_train)
    y_test_grid = best_grid_model.predict(X_test)

    grid_train_acc = round(float(accuracy_score(y_train, y_train_grid) * 100), 2)
    grid_test_acc = round(float(accuracy_score(y_test, y_test_grid) * 100), 2)
    grid_gap = round(grid_train_acc - grid_test_acc, 2)
    grid_prec = round(float(precision_score(y_test, y_test_grid, zero_division=0) * 100), 2)
    grid_rec = round(float(recall_score(y_test, y_test_grid, zero_division=0) * 100), 2)
    grid_f1 = round(float(f1_score(y_test, y_test_grid, zero_division=0) * 100), 2)

    grid_status = "Overfitting" if grid_gap > 5.0 else ("Underfitting" if grid_train_acc < 65.0 else "Good Fit (Optimal)")

    print(f"GridSearchCV Best Params: {grid_search.best_params_}")
    print(f"GridSearchCV CV Score: {round(grid_search.best_score_ * 100, 2)}% | Test Acc: {grid_test_acc}%")

    saved_models_dict["Gradient Boosting (GridSearch)"] = {
        'model': best_grid_model,
        'accuracy': grid_test_acc,
        'train_accuracy': grid_train_acc,
        'test_accuracy': grid_test_acc,
        'fit_status': grid_status,
        'precision': grid_prec,
        'recall': grid_rec,
        'f1': grid_f1,
        'is_scratch': False
    }

    # 3B. RandomizedSearchCV
    print("\n--> Running RandomizedSearchCV...")
    rand_param_dist = {
        'n_estimators': [50, 75, 100, 125, 150, 200],
        'max_depth': [3, 4, 5, 6, 7, 8],
        'learning_rate': [0.01, 0.03, 0.05, 0.08, 0.1, 0.15],
        'subsample': [0.7, 0.8, 0.9, 1.0],
        'min_samples_split': [2, 5, 10]
    }
    rand_search = RandomizedSearchCV(
        estimator=GradientBoostingClassifier(random_state=42),
        param_distributions=rand_param_dist,
        n_iter=15,
        cv=5,
        scoring='accuracy',
        random_state=42,
        n_jobs=-1
    )
    rand_search.fit(X_train, y_train)

    best_rand_model = rand_search.best_estimator_
    y_train_rand = best_rand_model.predict(X_train)
    y_test_rand = best_rand_model.predict(X_test)

    rand_train_acc = round(float(accuracy_score(y_train, y_train_rand) * 100), 2)
    rand_test_acc = round(float(accuracy_score(y_test, y_test_rand) * 100), 2)
    rand_gap = round(rand_train_acc - rand_test_acc, 2)
    rand_prec = round(float(precision_score(y_test, y_test_rand, zero_division=0) * 100), 2)
    rand_rec = round(float(recall_score(y_test, y_test_rand, zero_division=0) * 100), 2)
    rand_f1 = round(float(f1_score(y_test, y_test_rand, zero_division=0) * 100), 2)

    rand_status = "Overfitting" if rand_gap > 5.0 else ("Underfitting" if rand_train_acc < 65.0 else "Good Fit (Optimal)")

    print(f"RandomizedSearchCV Best Params: {rand_search.best_params_}")
    print(f"RandomizedSearchCV CV Score: {round(rand_search.best_score_ * 100, 2)}% | Test Acc: {rand_test_acc}%")

    saved_models_dict["Gradient Boosting (RandomSearch)"] = {
        'model': best_rand_model,
        'accuracy': rand_test_acc,
        'train_accuracy': rand_train_acc,
        'test_accuracy': rand_test_acc,
        'fit_status': rand_status,
        'precision': rand_prec,
        'recall': rand_rec,
        'f1': rand_f1,
        'is_scratch': False
    }

    best_acc = 0.0
    best_model_name = ""

    for name, item in saved_models_dict.items():
        if item['accuracy'] > best_acc:
            best_acc = item['accuracy']
            best_model_name = name

    print("\n" + "=" * 80)
    print(f"BEST MODEL IDENTIFIED: '{best_model_name}' with {best_acc}% Test Accuracy!")
    print("=" * 80)

    payload = {
        'models': saved_models_dict,
        'features': features,
        'best_model': best_model_name,
        'default_model': best_model_name
    }

    with open('cardio_models.pkl', 'wb') as f:
        pickle.dump(payload, f)

    with open('cardio_model.pkl', 'wb') as f:
        pickle.dump({
            'model': saved_models_dict[best_model_name]['model'],
            'accuracy': saved_models_dict[best_model_name]['accuracy'],
            'features': features
        }, f)

    print(f" 'cardio_models.pkl' and 'cardio_model.pkl' saved! Best model set to '{best_model_name}'")

    api_pkl_path = os.path.join('..', 'api', 'cardio_model.pkl')
    if os.path.exists(os.path.dirname(api_pkl_path)):
        shutil.copy('cardio_model.pkl', api_pkl_path)
        print(f" Updated '{api_pkl_path}' with the latest best model!")

if __name__ == '__main__':
    run_training()

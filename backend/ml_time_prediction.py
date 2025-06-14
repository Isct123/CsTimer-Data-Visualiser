from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge, Lasso
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_absolute_percentage_error
import matplotlib.pyplot as plt

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error


# ✅ Remove inf rows and make a safe copy
df = df[np.isfinite(df["time"])].copy()

# Convert to datetime
df["date"] = pd.to_datetime(df["date"])

# Extract features safely
df["hour"] = df["date"].dt.hour
df["minute"] = df["date"].dt.minute
df["second"] = df["date"].dt.second
df["dayofweek"] = df["date"].dt.dayofweek
df["day"] = df["date"].dt.day
df["month"] = df["date"].dt.month

# Prepare data
X = df[["hour", "minute", "second", "dayofweek", "day", "month"]]
y = df["time"]



# Define models and their hyperparameters
models = {
    "RandomForest": (RandomForestRegressor(), {
        "n_estimators": [50, 100, 200],
        "max_depth": [None, 10, 20],
        "min_samples_split": [2, 5, 10]
    }),
    "GradientBoosting": (GradientBoostingRegressor(), {
        "n_estimators": [100, 200],
        "learning_rate": [0.05, 0.1],
        "max_depth": [3, 5]
    }),
    "Ridge": (Ridge(), {
        "alpha": [0.01, 0.1, 1, 10, 100]
    }),
    "Lasso": (Lasso(), {
        "alpha": [0.01, 0.1, 1, 10, 100]
    }),
    "SVR": (SVR(), {
        "C": [0.1, 1, 10],
        "epsilon": [0.01, 0.1, 1],
        "kernel": ["rbf", "linear"]
    }),
    "KNN": (KNeighborsRegressor(), {
        "n_neighbors": [3, 5, 10],
        "weights": ["uniform", "distance"]
    })
}

results = {}
best_model = None
best_model_name = ""
best_accuracy = -float("inf")

# Train and evaluate each model
for name, (base_model, param_grid) in models.items():
    search = RandomizedSearchCV(base_model, param_grid, n_iter=5, cv=3, n_jobs=-1, random_state=42)
    search.fit(X_train, y_train)
    best_estimator = search.best_estimator_
    y_pred = best_estimator.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    accuracy = 100 * (1 - mape)
    results[name] = round(accuracy, 2)

    # Update best model if current model is better
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = best_estimator
        best_model_name = name

# Assign the best model to variable `model`
model = best_model
print(f"✅ Best Model: {best_model_name} with Accuracy: {best_accuracy:.2f}%")

# Plot results
plt.figure(figsize=(10, 6))
plt.bar(results.keys(), results.values(), color='skyblue')
plt.ylabel("Approximate Accuracy (%)")
plt.title("Model Accuracy Comparison")
plt.xticks(rotation=45)
plt.ylim(0, 100)
plt.grid(axis="y", linestyle="--", alpha=0.6)
plt.tight_layout()
plt.show()

# Final output
results

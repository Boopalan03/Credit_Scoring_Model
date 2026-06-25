import os
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Classifiers
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
try:
    from xgboost import XGBClassifier
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False
    print("XGBoost not installed. Training will proceed with other classifiers.")

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'credit_model.pkl')

def generate_indian_credit_dataset(num_records=10000, random_seed=42):
    """Generates a realistic synthetic credit dataset tailored to Indian banking parameters."""
    np.random.seed(random_seed)
    
    print(f"Generating {num_records} synthetic records...")
    
    # 1. Age (18 to 65)
    age = np.random.randint(18, 66, size=num_records)
    
    # 2. Employment Type
    emp_types = ['Government', 'Private', 'Self Employed', 'Business']
    emp_type = np.random.choice(emp_types, size=num_records, p=[0.15, 0.50, 0.20, 0.15])
    
    # 3. Monthly Income in INR (₹15,000 to ₹3,00,000)
    # Using a log-normal distribution to represent income inequality realistically
    income_base = np.random.lognormal(mean=10.8, sigma=0.6, size=num_records)
    monthly_income = np.clip(income_base, 12000, 350000).astype(int)
    
    # 4. Monthly Expenses in INR (typically 30% to 70% of income)
    expenses_pct = np.random.uniform(0.30, 0.70, size=num_records)
    monthly_expenses = (monthly_income * expenses_pct).astype(int)
    
    # 5. Savings in INR (correlated with age and income)
    savings_multiplier = np.random.uniform(0.5, 8.0, size=num_records) * (age / 30.0)
    savings = (monthly_income * savings_multiplier).astype(int)
    # Ensure savings are at least some small amount or zero
    savings = np.clip(savings, 0, 2500000)
    
    # 6. Current Account Balance in INR (₹2,000 to ₹5,00,000)
    current_balance = np.random.exponential(scale=30000, size=num_records) + 2000
    current_balance = np.clip(current_balance, 2000, 800000).astype(int)
    
    # 7. Existing EMI in INR (40% have no EMI, others have EMI up to 35% of income)
    has_emi = np.random.choice([0, 1], size=num_records, p=[0.40, 0.60])
    emi_pct = np.random.uniform(0.05, 0.35, size=num_records)
    existing_emi = (monthly_income * emi_pct * has_emi).astype(int)
    
    # 8. Loan Purpose
    purposes = ['Home', 'Car', 'Personal', 'Education', 'Business']
    loan_purpose = np.random.choice(purposes, size=num_records, p=[0.25, 0.20, 0.25, 0.15, 0.15])
    
    # 9. Loan Amount in INR (influenced by loan purpose and income)
    # Home: large, Car: medium, Personal: small, Education: small/medium, Business: medium/large
    loan_multipliers = {
        'Home': np.random.uniform(15, 60),
        'Car': np.random.uniform(5, 15),
        'Personal': np.random.uniform(1, 8),
        'Education': np.random.uniform(2, 12),
        'Business': np.random.uniform(5, 25)
    }
    
    loan_amount = []
    for i in range(num_records):
        purpose = loan_purpose[i]
        income = monthly_income[i]
        mult = loan_multipliers[purpose]
        # Home loans can be very large, personal loans smaller
        amount = int(income * mult * np.random.uniform(0.8, 1.2))
        # Cap loan amounts to realistic Indian figures
        if purpose == 'Home':
            amount = np.clip(amount, 500000, 7500000)
        elif purpose == 'Car':
            amount = np.clip(amount, 100000, 2000000)
        elif purpose == 'Personal':
            amount = np.clip(amount, 20000, 1500000)
        elif purpose == 'Education':
            amount = np.clip(amount, 30000, 2500000)
        else: # Business
            amount = np.clip(amount, 100000, 5000000)
        loan_amount.append(amount)
    loan_amount = np.array(loan_amount)
    
    # 10. Credit Utilization (0% to 100%)
    credit_util = np.random.uniform(0.0, 1.0, size=num_records)
    
    # 11. Previous Defaults (weighted: 85% none, 10% one, 4% two, 1% three)
    prev_defaults = np.random.choice([0, 1, 2, 3], size=num_records, p=[0.85, 0.10, 0.04, 0.01])
    
    # 12. Credit History Length in Years (0 to 25 years, capped by age - 18)
    max_history = np.clip(age - 18, 0, 25)
    credit_history_years = np.array([np.random.randint(0, max(1, mh + 1)) for mh in max_history])
    
    # 13. Number of Active Loans (0 to 5)
    active_loans = np.random.choice([0, 1, 2, 3, 4, 5], size=num_records, p=[0.40, 0.30, 0.15, 0.08, 0.05, 0.02])
    
    # 14. Approval Logic (deterministic rules + logistic noise to simulate real-world decisions)
    # Debt-to-Income (DTI) ratio
    # Estimated new EMI (1.5% of loan amount monthly)
    est_new_emi = loan_amount * 0.015
    total_emi = existing_emi + est_new_emi
    dti = total_emi / (monthly_income + 1.0)
    
    approved = []
    
    # Calculate score and approval status per applicant
    for i in range(num_records):
        score = 100
        val_dti = dti[i]
        if val_dti > 0.65:
            score -= 45
        elif val_dti > 0.45:
            score -= 25
        elif val_dti < 0.25:
            score += 15
            
        # Defaults penalty (major risk factor)
        defaults = prev_defaults[i]
        if defaults > 0:
            score -= 40 * defaults
            if defaults >= 2:
                score -= 60  # Hard penalty
                
        # Credit Utilization penalty
        util = credit_util[i]
        if util > 0.75:
            score -= 25
        elif util > 0.50:
            score -= 10
        elif util < 0.30:
            score += 15
            
        # Savings-to-Loan ratio
        sav = savings[i]
        loan = loan_amount[i]
        ratio = sav / (loan + 1.0)
        if ratio > 0.4:
            score += 20
        elif ratio < 0.05:
            score -= 15
            
        # Credit History Length
        hist = credit_history_years[i]
        if hist > 8:
            score += 15
        elif hist < 2:
            score -= 10
            
        # Active Loans
        loans = active_loans[i]
        if loans > 3:
            score -= 15
            
        # Employment stability
        emp = emp_type[i]
        if emp in ['Government', 'Private']:
            score += 10
        else:
            score -= 5
            
        # Disproportionate Loan size (potential fraud / risk)
        inc = monthly_income[i]
        if loan > inc * 36:
            score -= 25
            
        # Calculate sigmoid probability and sample approval
        prob_i = 1.0 / (1.0 + np.exp(-(score - 35.0) / 12.0))
        approved_i = 1 if np.random.rand() < prob_i else 0
        approved.append(approved_i)
        
    approved = np.array(approved)
    
    # Construct DataFrame
    df = pd.DataFrame({
        'Age': age,
        'Employment_Type': emp_type,
        'Monthly_Income_INR': monthly_income,
        'Monthly_Expenses_INR': monthly_expenses,
        'Savings_INR': savings,
        'Current_Balance_INR': current_balance,
        'Existing_EMI_INR': existing_emi,
        'Loan_Amount_INR': loan_amount,
        'Credit_Utilization': credit_util,
        'Previous_Defaults': prev_defaults,
        'Credit_History_Years': credit_history_years,
        'Active_Loans': active_loans,
        'Loan_Purpose': loan_purpose,
        'Approved': approved
    })
    
    return df

def build_preprocessing_pipeline():
    """Builds a scikit-learn ColumnTransformer for categorical and numerical features."""
    num_cols = [
        'Age', 'Monthly_Income_INR', 'Monthly_Expenses_INR', 'Savings_INR',
        'Current_Balance_INR', 'Existing_EMI_INR', 'Loan_Amount_INR',
        'Credit_Utilization', 'Previous_Defaults', 'Credit_History_Years', 'Active_Loans'
    ]
    
    cat_cols = ['Employment_Type', 'Loan_Purpose']
    
    # Numerical pipeline: impute missing values (just in case), scale
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Categorical pipeline: impute missing values, one-hot encode
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Column Transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_cols),
            ('cat', cat_transformer, cat_cols)
        ]
    )
    
    return preprocessor

def main():
    print("--- CreditScoreAI ML Training Pipeline ---")
    
    # 1. Generate synthetic dataset
    df = generate_indian_credit_dataset(num_records=10000)
    
    # Save dataset to CSV
    df.to_csv(DATA_PATH, index=False)
    print(f"Dataset saved to: {DATA_PATH}")
    
    # 2. Split features and target
    X = df.drop(columns=['Approved'])
    y = df['Approved']
    
    # Split into 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    
    # 3. Setup Preprocessor
    preprocessor = build_preprocessing_pipeline()
    
    # Preprocess training data to fit models
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    # 4. Define Classifiers
    models = {
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'Decision Tree': DecisionTreeClassifier(random_state=42, max_depth=6),
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100, max_depth=10)
    }
    
    if XGB_AVAILABLE:
        models['XGBoost'] = XGBClassifier(
            random_state=42,
            eval_metric='logloss',
            max_depth=5,
            n_estimators=100,
            learning_rate=0.1
        )
        
    # Evaluate each model
    results = {}
    best_model_name = None
    best_accuracy = -1.0
    
    print("\nTraining models and evaluating accuracies...")
    for name, model in models.items():
        model.fit(X_train_proc, y_train)
        y_pred = model.predict(X_test_proc)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        try:
            y_prob = model.predict_proba(X_test_proc)[:, 1]
            auc = roc_auc_score(y_test, y_prob)
        except:
            auc = 0.0
            
        results[name] = {
            'Accuracy': acc,
            'Precision': prec,
            'Recall': rec,
            'F1-Score': f1,
            'ROC-AUC': auc,
            'model_obj': model
        }
        print(f"  {name:20} -> Accuracy: {acc:.4f} | F1-Score: {f1:.4f} | ROC-AUC: {auc:.4f}")
        
        # Select best model based on accuracy
        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            
    print(f"\nWinner: **{best_model_name}** with Accuracy: {best_accuracy:.4f}")
    
    # 5. Create final pipeline with best classifier
    best_classifier = results[best_model_name]['model_obj']
    
    final_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', best_classifier)
    ])
    
    # Train the full pipeline on all data (or train set, let's fit on train set to be standard, or full data for maximum utility)
    final_pipeline.fit(X_train, y_train)
    
    # Save the pipeline
    joblib.dump(final_pipeline, MODEL_PATH)
    print(f"Successfully saved final model pipeline to: {MODEL_PATH}")
    
    # Save comparison report as a quick markdown file
    report_path = os.path.join(BASE_DIR, 'model_comparison.md')
    with open(report_path, 'w') as f:
        f.write("# Model Comparison Report\n\n")
        f.write("| Algorithm | Accuracy | Precision | Recall | F1-Score | ROC-AUC |\n")
        f.write("| --- | --- | --- | --- | --- | --- |\n")
        for name, metrics in results.items():
            f.write(f"| {name} | {metrics['Accuracy']:.4f} | {metrics['Precision']:.4f} | {metrics['Recall']:.4f} | {metrics['F1-Score']:.4f} | {metrics['ROC-AUC']:.4f} |\n")
        f.write(f"\n**Best Model Selected**: {best_model_name} (Accuracy: {best_accuracy:.4f})\n")
    print(f"Comparison report written to: {report_path}")

if __name__ == '__main__':
    main()

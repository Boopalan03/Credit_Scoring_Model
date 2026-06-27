import os
import sys
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'credit_model.pkl')

app = Flask(__name__)
# Enable CORS for frontend and backend communication
CORS(app)

# Global model variable
model = None

def load_model():
    """Loads the serialized machine learning model."""
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print(f"Successfully loaded ML model from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Please run train.py first.")

# Load model on startup
load_model()

def get_risk_level(score):
    """Maps the credit score to its corresponding risk level."""
    if score >= 751:
        return "Excellent", "LOW RISK"
    elif score >= 651:
        return "Good", "LOW RISK"
    elif score >= 501:
        return "Medium Risk", "MEDIUM RISK"
    elif score >= 301:
        return "High Risk", "HIGH RISK"
    else:
        return "Very High Risk", "VERY HIGH RISK"

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'healthy',
        'service': 'CreditScoreAI ML Server',
        'message': 'Welcome to the CreditScoreAI ML Server. Please use the /predict endpoint (POST) for predictions, or /health (GET) to check service status.',
        'endpoints': {
            'health': '/health',
            'predict': '/predict'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'CreditScoreAI ML Server',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    global model
    if model is None:
        # Try loading again if it wasn't loaded
        load_model()
        if model is None:
            return jsonify({'error': 'Machine learning model is not available'}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        # Required fields in the input
        required_fields = [
            'Age', 'Employment_Type', 'Monthly_Income_INR', 'Monthly_Expenses_INR',
            'Savings_INR', 'Current_Balance_INR', 'Existing_EMI_INR', 'Loan_Amount_INR',
            'Credit_Utilization', 'Previous_Defaults', 'Credit_History_Years', 'Active_Loans',
            'Loan_Purpose'
        ]
        
        # Verify fields
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Convert input types
        age = int(data['Age'])
        emp_type = str(data['Employment_Type'])
        income = float(data['Monthly_Income_INR'])
        expenses = float(data['Monthly_Expenses_INR'])
        savings = float(data['Savings_INR'])
        current_balance = float(data['Current_Balance_INR'])
        existing_emi = float(data['Existing_EMI_INR'])
        loan_amount = float(data['Loan_Amount_INR'])
        credit_util = float(data['Credit_Utilization']) / 100.0 if float(data['Credit_Utilization']) > 1.0 else float(data['Credit_Utilization'])
        prev_defaults = int(data['Previous_Defaults'])
        credit_history = int(data['Credit_History_Years'])
        active_loans = int(data['Active_Loans'])
        purpose = str(data['Loan_Purpose'])

        # Build DataFrame for prediction (matching the columns trained on)
        df_input = pd.DataFrame([{
            'Age': age,
            'Employment_Type': emp_type,
            'Monthly_Income_INR': income,
            'Monthly_Expenses_INR': expenses,
            'Savings_INR': savings,
            'Current_Balance_INR': current_balance,
            'Existing_EMI_INR': existing_emi,
            'Loan_Amount_INR': loan_amount,
            'Credit_Utilization': credit_util,
            'Previous_Defaults': prev_defaults,
            'Credit_History_Years': credit_history,
            'Active_Loans': active_loans,
            'Loan_Purpose': purpose
        }])

        # Run prediction
        # model is a Pipeline: it preprocesses internally!
        pred_approved = int(model.predict(df_input)[0])
        pred_probs = model.predict_proba(df_input)[0]
        prob_approved = float(pred_probs[1])

        # 1. Calculate CIBIL-like credit score (300 to 900)
        base_score = 620
        
        # Payment History (Defaults) - major factor (up to -240 points)
        defaults_penalty = min(prev_defaults * 85, 250)
        base_score -= defaults_penalty
        
        # Credit Utilization (up to -100 or +40)
        if credit_util < 0.30:
            base_score += 40
        elif credit_util <= 0.50:
            base_score += 10
        elif credit_util <= 0.75:
            base_score -= 30
        else:
            base_score -= 100
            
        # Credit History Length (up to +100)
        history_bonus = min(credit_history * 8, 100)
        base_score += history_bonus
        
        # Active Loans (up to -60)
        if active_loans == 0:
            base_score += 10
        elif active_loans >= 3:
            base_score -= min((active_loans - 2) * 20, 60)
            
        # Debt-to-Income (Existing EMI / Income)
        dti = existing_emi / (income + 1.0)
        if dti > 0.50:
            base_score -= 60
        elif dti > 0.30:
            base_score -= 30
        else:
            base_score += 20

        # Adjust score slightly based on ML probability to keep them correlated
        ml_adjustment = (prob_approved - 0.5) * 50
        base_score += ml_adjustment

        credit_score = int(np.clip(base_score, 300, 900))
        
        # 2. Map score to rating and risk level
        rating, risk_level = get_risk_level(credit_score)

        # Force eligibility correlation: if model predicts reject, make not eligible
        # In a real system, the score would trigger a reject anyway
        is_eligible = pred_approved == 1 and credit_score >= 500
        eligibility_status = "Eligible" if is_eligible else "Not Eligible"

        # 3. Calculate Maximum Eligible Loan Amount
        # Home: 45x monthly income, Business: 24x, Car: 12x, Education: 12x, Personal: 8x
        # Scaled by credit score multiplier
        if is_eligible:
            score_factor = (credit_score - 500) / 400.0  # 0.0 to 1.0
            score_multiplier = 0.4 + 0.6 * score_factor  # 0.4 to 1.0
            
            purpose_multipliers = {
                'Home': 50,
                'Business': 24,
                'Car': 12,
                'Education': 15,
                'Personal': 8
            }
            
            mult = purpose_multipliers.get(purpose, 8)
            # Calculate repayment capacity (50% DTI cap)
            repayment_capacity = max(0.0, (income * 0.5) - existing_emi)
            
            # Max loan is the minimum of capacity-based (over 5 years for home, 3 years for others)
            term_months = 60 if purpose == 'Home' else 36
            capacity_loan = repayment_capacity * term_months
            
            income_cap = income * mult * score_multiplier
            
            max_loan = min(capacity_loan, income_cap)
            
            # Round to nearest 10,000
            max_loan = int(np.round(max_loan / 10000) * 10000)
            
            # Ensure it is at least a base amount, or cap if it goes extremely high
            max_loan = max(50000, max_loan)
        else:
            max_loan = 0

        # 4. Recommended Interest Rate
        base_interest = {
            'Home': 8.5,
            'Car': 9.5,
            'Personal': 11.5,
            'Education': 8.2,
            'Business': 12.5
        }
        interest_rate = base_interest.get(purpose, 10.5)
        
        # Score adjustments
        if credit_score >= 751:
            interest_rate -= 1.0  # Excellent
        elif credit_score >= 651:
            interest_rate -= 0.5  # Good
        elif credit_score >= 501:
            interest_rate += 0.8  # Medium
        elif credit_score >= 301:
            interest_rate += 2.5  # High
        else:
            interest_rate += 4.0  # Very High

        interest_rate = float(np.round(np.clip(interest_rate, 6.5, 18.0), 1))

        # 5. Explainable AI (XAI) Reasons Checklist
        reasons = []
        if is_eligible:
            if income > 60000:
                reasons.append("✔ High Income")
            if prev_defaults == 0:
                reasons.append("✔ No Defaults")
            if savings > (loan_amount * 0.3):
                reasons.append("✔ Good Savings")
            if emp_type in ['Government', 'Private']:
                reasons.append("✔ Stable Job")
            if credit_util < 0.30:
                reasons.append("✔ Low Credit Utilization")
            if credit_score >= 750:
                reasons.append("✔ Excellent Credit History")
            if len(reasons) == 0:
                reasons.append("✔ Moderate Income & Debt Balance")
        else:
            if income < 30000:
                reasons.append("✘ Income too low")
            dti_ratio = (existing_emi + (loan_amount * 0.015)) / income
            if existing_emi > 15000 or dti_ratio > 0.45:
                reasons.append("✘ High EMI")
            if prev_defaults > 0:
                reasons.append("✘ Previous Defaults")
            if savings < 50000 or savings < (loan_amount * 0.1):
                reasons.append("✘ Low Savings")
            if credit_util > 0.70:
                reasons.append(f"✘ Credit utilization {int(credit_util * 100)}%")
            if credit_score < 600:
                reasons.append("✘ Low Credit Score")
            if active_loans > 3:
                reasons.append("✘ Too many active loans")
            if len(reasons) == 0:
                reasons.append("✘ High overall risk profile")

        # Return results
        return jsonify({
            'approved': bool(is_eligible),
            'credit_score': credit_score,
            'rating': rating,
            'risk_level': risk_level,
            'eligibility': eligibility_status,
            'max_loan': max_loan,
            'recommended_interest': interest_rate,
            'reasons': reasons,
            'probability_approved': float(prob_approved)
        })

    except Exception as e:
        print(f"Error in prediction endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Flask server runs on port 5001 by default, or checks PORT for Render
    port = int(os.environ.get('PORT', os.environ.get('ML_PORT', 5001)))
    print(f"Starting Flask ML API Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

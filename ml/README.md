# CreditWise - Machine Learning Credit Scoring Pipeline (Phase 1)

This project contains the machine learning core of the **CreditWise AI-Powered Credit Scoring and Loan Eligibility Prediction System**. The model is trained on the **UCI Statlog (German Credit Data)** dataset to evaluate the creditworthiness of loan applicants.

## Directory Structure

```
ml/
├── data/
│   ├── raw_german.csv                  # Original dataset with column names
│   └── german_credit_prepared.csv      # Mapped, cleaned, and binary-target dataset
├── models/
│   └── credit_scoring_pipeline.joblib  # Serialized best-performing pipeline
├── reports/
│   ├── plots/                          # EDA visualizations
│   │   ├── target_distribution.png
│   │   ├── numerical_distributions.png
│   │   ├── correlation_matrix.png
│   │   ├── risk_by_checking_account.png
│   │   ├── risk_by_savings_account.png
│   │   └── risk_by_credit_history.png
│   └── model_comparison.md            # Benchmark of different algorithms
├── src/
│   ├── download_data.py               # Dataset acquisition and mapping script
│   ├── eda.py                         # Exploratory Data Analysis script
│   ├── train.py                       # Preprocessing and model training pipeline
│   └── predict.py                     # Real-time scoring CLI
├── requirements.txt                   # Python package dependencies
└── README.md                          # Phase 1 documentation (this file)
```

## Dataset & Mappings

The **UCI German Credit Dataset** contains 1,000 credit applications with 20 attributes:
- **Numerical Features (7):** loan duration, credit amount, installment rate, residence duration, age, number of existing credits, number of maintenance dependents.
- **Categorical Features (13):** status of checking account, credit history, loan purpose, savings status, employment duration, personal status/sex, other debtors/guarantors, property types, other installment plans, housing status, job type, telephone, foreign worker status.

The raw category codes (e.g., `A11`, `A34`) are mapped to human-readable text representations during preprocessing. The target variable is binary `credit_risk` where **`1` indicates Good Credit Risk** and **`0` indicates Bad Credit Risk**.

## Performance Summary

We evaluated four different machine learning classifiers. Here is the model comparison on the test split (20% of the dataset):

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|---|
| **Logistic Regression** | 0.7050 | 0.7755 | 0.8143 | 0.7944 | 0.7594 |
| **Decision Tree** | 0.6750 | 0.7219 | 0.8714 | 0.7896 | 0.6675 |
| **Random Forest** | **0.7750** | **0.8025** | **0.9000** | **0.8485** | **0.7963** |
| **XGBoost** | 0.7300 | 0.7986 | 0.8214 | 0.8099 | 0.7323 |

- **Best Model Selected:** **Random Forest**
- **ROC-AUC Score:** **0.7963**

The best model was fitted with a complete end-to-end preprocessing pipeline (`StandardScaler` for numerical columns and `OneHotEncoder` for categorical columns) and saved in `ml/models/credit_scoring_pipeline.joblib`.

## Credit Scoring Algorithm

The system converts the predicted probability $P(\text{Good Risk})$ into a FICO-like credit score from **300 to 850**:

$$\text{Credit Score} = 300 + 550 \times P(\text{Good Risk})$$

The credit score is mapped to the following credit rating bands:
- **Excellent:** 740 – 850
- **Good:** 670 – 739
- **Fair:** 580 – 669
- **Poor:** 300 – 579

### Loan Approval Threshold
Applicants with a credit score of **580 or above** (Fair, Good, or Excellent ratings) are recommended for loan approval. Applicants below 580 (Poor rating) are recommended for denial.

## How to Run

### 1. Setup Environment
Ensure Python 3.11 is installed, then create and activate a virtual environment:
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Download and Preprocess Data
```powershell
python src/download_data.py
```

### 3. Generate EDA Reports
```powershell
python src/eda.py
```

### 4. Train Models
```powershell
python src/train.py
```

### 5. Test CLI Predictions
Run the script without arguments to see demo predictions:
```powershell
python src/predict.py
```

Or pass a specific profile via JSON string:
```powershell
python src/predict.py --json-str "{\"checking_account\": \"no checking account\", \"duration\": 12, \"credit_history\": \"existing credits paid back duly till now\", \"purpose\": \"car (new)\", \"credit_amount\": 2500, \"savings_account\": \">= 1000 DM\", \"employment_since\": \">= 7 years\", \"installment_rate\": 2, \"personal_status_sex\": \"male: single\", \"other_debtors\": \"none\", \"residence_since\": 2, \"property\": \"real estate\", \"age\": 35, \"other_installment_plans\": \"none\", \"housing\": \"own\", \"existing_credits\": 1, \"job\": \"skilled employee / official\", \"people_liable\": 1, \"telephone\": \"none\", \"foreign_worker\": \"yes\"}"
```

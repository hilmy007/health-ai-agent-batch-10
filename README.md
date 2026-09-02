# AI Health Copilot Pro (v3.1.0)
**Full-Stack ML + Agentic AI Clinical Risk Stratification System**  
*Author:* Dr. Harry Patria, Chief Data & AI Officer, Patria & Co.  
*Framework:* `fullstack-analytics-builder` + Agentic ML Integration (Chapter 10)  
*Dataset:* Pima Indians Diabetes Database (National Institute of Diabetes and Digestive and Kidney Diseases)

---

## 🩺 System Overview & Clinical Problem Statement

Traditional clinical diabetes detection is predominantly **reactive**, diagnosing disease only after marked hyperglycemic symptoms or irreversible end-organ damage (retinopathy, nephropathy, neuropathy, cardiovascular disease) have manifested.

**AI Health Copilot Pro** transitions healthcare providers to **proactive risk stratification** through a closed-loop **ITDO Framework**:
1. **Insights**: Calibrated scikit-learn Pipeline (AUC-ROC: 0.852) evaluating 8 clinical biomarkers with median zero-imputation.
2. **Triggers**: Deterministic clinical flag assertions (Glucose > 99 mg/dL, BP > 80 mmHg, BMI > 24.9 kg/m², Age ≥ 45) and automated alert generation at $\ge 0.70$ probability.
3. **Decisions**: Structured clinical reasoning via Gemini 3.7 Flash with zero hallucinated biomarkers.
4. **Operations**: Actionable Kanban workflow (TODO, IN_PROGRESS, DONE) orchestrating confirmatory 2-Hour 75g Oral Glucose Tolerance Tests (OGTT), Medical Nutrition Therapy, and Continuous Glucose Monitoring (CGM) onboarding.

---

## ⚙️ Architecture & CRISP-DM Machine Learning Pipeline

### CRISP-DM 6-Phase Execution
- **Phase 1: Business & Clinical Understanding** — Framing Type-2 diabetes risk identification as an early screening classification task.
- **Phase 2: Data Understanding & Biological Zeros Audit** — Identifying laboratory missing values recorded as zero:
  - `Insulin`: 374 zeros (48.7%)
  - `SkinThickness`: 227 zeros (29.6%)
  - `BloodPressure`: 35 zeros (4.56%)
  - `BMI`: 11 zeros (1.43%)
  - `Glucose`: 5 zeros (0.65%)
- **Phase 3: Data Preparation & Leak-Free Pipeline** — `Pipeline([('imputer', SimpleImputer(strategy='median')), ('scaler', StandardScaler()), ('classifier', Model)])`.
- **Phase 4: Modeling & Calibration** — Random Forest + Calibrated Logistic Regression ensemble modeling non-linear biomarker interactions.
- **Phase 5: Evaluation & Threshold Setting** — Stratified 5-Fold Cross-Validation achieving AUC-ROC 0.852 and F1-Score 0.752.
- **Phase 6: Deployment & Clinical Operations** — Express / FastAPI REST API with real-time inference, persistent alert queues, and task dispatching.

---

## 🚀 Key Features

- 📊 **Clinical Dashboard**: Real-time population risk stratification, active triggers counter, and one-click benchmark case loaders.
- 🩺 **Single Patient Predictor**: Interactive sliders for 8 biomarkers with live 300ms debounced probability gauge, deterministic flag chips, and Gemini clinical reasoning.
- 📁 **Batch CSV Predictor**: Cohort upload with drag-and-drop, automated median imputation, sortable risk table, and scored CSV export.
- 🚨 **Alerts & Triggers Board**: Automated alert threshold surveillance ($\ge 0.70$), clinician assignment, and escalation workflows.
- 📋 **Operations Kanban Board**: 4-column operational management tracking confirmatory diagnostic protocols and due dates.
- 📈 **Model Insights**: Interactive ROC curve, Gini feature importance rankings, and data audit tables.
- ⚙️ **Settings & Customization**: Customizable alert thresholds, normal ranges, and institutional disclaimer text.
- 💻 **Code & Schema Inspector**: Built-in modal inspecting Python ML training pipelines, FastAPI backend, and Supabase RLS migrations.

---

## 🛠️ Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Gemini reasoning)
```bash
# Set your Gemini API key in .env or settings
GEMINI_API_KEY=your_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to interact with the clinical platform.

### 4. Build Production Bundle
```bash
npm run build
npm start
```

---

## ⚖️ Clinical Decision Support Disclaimer

**AI Health Copilot Pro** is an investigational analytics system designed to assist healthcare professionals in early metabolic risk stratification. It is not an automated diagnostic tool and does not replace clinical judgment, physical examinations, or standardized laboratory diagnostic testing.

import joblib
import pandas as pd
import numpy as np
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
class MLEngine:
    def __init__(self):
        try:
            self.forecasting_model = joblib.load(os.path.join(MODEL_DIR, "forecasting_model.pkl"))
            self.admin_model = joblib.load(os.path.join(MODEL_DIR, "admin_hourly_model.pkl"))
            self.preference_model = joblib.load(os.path.join(MODEL_DIR, "preference_model.pkl"))
            self.clustering_model = joblib.load(os.path.join(MODEL_DIR, "clustering_model.pkl"))
            self.le_country = joblib.load(os.path.join(MODEL_DIR, "le_country.pkl"))
            self.le_event = joblib.load(os.path.join(MODEL_DIR, "le_event.pkl"))
            print("ML Engine: All models loaded successfully.")
        except Exception as e:
            print(f"ML Engine Error loading models: {e}")
            self.forecasting_model = None
            self.admin_model = None
            self.preference_model = None
    def predict_preference(self, age: int, country: str):
        if not self.preference_model:
            return "General Entry"
        try:
            if country not in self.le_country.classes_:
                country_code = self.le_country.transform(['Other'])[0] 
            else:
                country_code = self.le_country.transform([country])[0]
            input_data = pd.DataFrame({'age': [age], 'country_code': [country_code]})
            event_code = self.preference_model.predict(input_data)[0]
            event_name = self.le_event.inverse_transform([event_code])[0]
            return event_name
        except Exception as e:
            print(f"Prediction Error: {e}")
            return "Elephant Bathing" 
    def get_visitor_segment(self, age: int, country_str: str, tickets: int):
        if not self.clustering_model:
            return 0
        try:
            if country_str not in self.le_country.classes_:
               country_code = 0
            else:
               country_code = self.le_country.transform([country_str])[0]
            segment = self.clustering_model.predict([[age, country_code, tickets]])[0]
            return int(segment)
        except:
            return 0
    def forecast_attendance(self, month: int, day_of_week: int):
        if not self.forecasting_model:
            return 0
        input_data = pd.DataFrame({
            'day_of_year': [month * 30],
            'month': [month],
            'day_of_week': [day_of_week]
        })
        prediction = self.forecasting_model.predict(input_data)[0]
        return max(0, int(prediction))
    def get_admin_forecast(self, month: int, day_of_week: int, hour: int, features: dict = None):
        if not self.admin_model:
            return 0
        try:
            feature_path = os.path.join(MODEL_DIR, "model_features.pkl")
            if not os.path.exists(feature_path):
                return self.forecast_attendance(month, day_of_week) // 8
            model_features = joblib.load(feature_path)
            input_dict = {feat: 0 for feat in model_features} 
            input_dict['day_of_year'] = month * 30
            input_dict['month'] = month
            input_dict['dow'] = day_of_week
            input_dict['is_weekend'] = 1 if day_of_week >= 5 else 0
            input_dict['hour_int'] = hour
            if features:
                loc = features.get('location', '')
                evt = features.get('event', '')
                if f"location_{loc}" in input_dict:
                    input_dict[f"location_{loc}"] = 1
                if f"event_name_{evt}" in input_dict:
                    input_dict[f"event_name_{evt}"] = 1
            input_df = pd.DataFrame([input_dict])
            prediction = self.admin_model.predict(input_df)[0]
            return max(0, int(prediction))
        except Exception as e:
            print(f"Admin Forecast Error: {e}")
            return 0
    def optimize_schedule(self, month: int):
        suggestions = []
        avg_daily_visitors = self.forecast_attendance(month, 6) 
        if avg_daily_visitors > 1000:
            suggestions.append({
                "action": "ADD_SESSION",
                "event": "Elephant Bathing",
                "time": "10:00 AM",
                "reason": f"High Forecast: {avg_daily_visitors} visitors expected per day in Month {month}. Bathing is the most popular event.",
                "confidence": 0.92
            })
            suggestions.append({
                "action": "INCREASE_CAPACITY",
                "event": "Fruit Feeding",
                "time": "09:00 AM",
                "reason": "Crowd congestion predicted at entrance.",
                "confidence": 0.85
            })
        elif avg_daily_visitors > 500:
             suggestions.append({
                "action": "PROMOTION",
                "event": "Paper Recycling Tour",
                "time": "All Day",
                "reason": "Moderate crowd. Good opportunity to upsell educational tours.",
                "confidence": 0.75
            })
        else:
             suggestions.append({
                "action": "REDUCE_STAFF",
                "event": "General",
                "time": "Weekday",
                "reason": f"Low Forecast: Only {avg_daily_visitors} visitors. Optimize operating costs.",
                "confidence": 0.88
            })
        if month in [7, 8]: 
             suggestions.append({
                "action": "SPECIAL_EVENT",
                "event": "Esala Perahera Parade",
                "time": "18:00 PM",
                "reason": "Seasonal Peak: Kandy Esala Perahera attracts cultural tourists.",
                "confidence": 0.98
            })
        return suggestions
ml_engine = MLEngine()

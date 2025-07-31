
import pandas as pd
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle

# Load the new dataset
file_path = 'ai_social_engineering_scams_dataset.csv'
df = pd.read_csv(file_path)

# Drop the incident_id column (not useful for prediction)
df = df.drop('incident_id', axis=1)

# Encode all categorical features
label_encoders = {}
for col in df.columns:
    if df[col].dtype == 'object':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

# Features and target
y = df['scam_type']
X = df.drop('scam_type', axis=1)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model (Multinomial Naive Bayes)
model = MultinomialNB()
model.fit(X_train, y_train)

# Save the model and encoders
pickle.dump(model, open('scam_model.pkl', 'wb'))
pickle.dump(label_encoders, open('label_encoders.pkl', 'wb'))

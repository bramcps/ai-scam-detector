import streamlit as st
from PIL import Image
import pytesseract
import pickle
import numpy as np

# Set path ke tesseract.exe 
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load model and vectorizer
with open('scam_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

def predict_scam(text):
    X = vectorizer.transform([text])
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0][pred]
    return 'Scam/Spam' if pred == 1 else 'Not Scam (Ham)', prob

st.set_page_config(page_title="AI Scam Detector", layout="centered")
st.title('🛡️ AI Scam Detector (Screenshot SMS/Message)')

uploaded_file = st.file_uploader('📤 Upload a screenshot image (PNG, JPG, etc.)', type=['png', 'jpg', 'jpeg'])

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption='🖼️ Uploaded Screenshot', use_column_width=True)
    st.write('🔍 Extracting text from image...')
    
    try:
        text = pytesseract.image_to_string(image)
        st.text_area('📝 Extracted Text', text, height=150)
        if text.strip():
            label, prob = predict_scam(text)
            st.markdown(f'### 📢 Prediction: **{label}**')
            st.markdown(f'### 📊 Confidence: **{prob:.2%}**')
        else:
            st.warning('⚠️ No text detected in the image.')
    except Exception as e:
        st.error(f"❌ OCR failed: {e}")

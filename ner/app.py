from flask import Flask, request, jsonify
import spacy
from spacy.language import Language
from spacy_langdetect import LanguageDetector
import os

app = Flask(__name__)

def get_lang_detector(nlp, name):
    return LanguageDetector()

Language.factory("language_detector", func=get_lang_detector)

class NERService:
    def __init__(self):
        self.ner_models = {}
        self._initialize_models()
    
    def _initialize_models(self):
        # Load NER models from the specified directory
        ner_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ner_fine_tuned_models')
        
        for model_name in os.listdir(ner_dir):
            model_path = os.path.join(ner_dir, model_name)
            if os.path.isdir(model_path):
                nlp = spacy.load(model_path)
                nlp.add_pipe('language_detector', last=True)
                self.ner_models[model_name] = nlp
    
    def get_ner_model(self, model_name):
        if model_name not in self.ner_models:
            raise KeyError(f"NER model '{model_name}' not found")
        return self.ner_models[model_name]

    def process_text(self, text, model_name):
        try:
            nlp = self.get_ner_model(model_name)
            doc = nlp(text)
            
            # Check language
            if doc._.language['language'] != 'fr':
                return {"error": "Text is not in French"}, 400
            
            # Extract entities
            entities = {
                "departure": next((ent.text for ent in doc.ents if ent.label_ == 'DEPARTURE'), None),
                "arrival": next((ent.text for ent in doc.ents if ent.label_ == 'ARRIVAL'), None)
            }
            
            return entities, 200
            
        except KeyError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            return {"error": f"Processing error: {str(e)}"}, 500

ner_service = NERService()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    text = data.get('text')
    model_name = data.get('model_name')
    
    if not text or not model_name:
        return jsonify({"error": "Missing required parameters"}), 400
    
    result, status_code = ner_service.process_text(text, model_name)
    return jsonify(result), status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import os

app = Flask(__name__)

class NLUService:
    def __init__(self):
        self.nlu_models = {}
        self._initialize_models()
    
    def _initialize_models(self):
        # Load NLU models from the specified directory
        nlu_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'nlu_fine_tuned_models')
        
        # Check if directory exists
        if not os.path.exists(nlu_dir):
            os.makedirs(nlu_dir)
            
        for model_name in os.listdir(nlu_dir):
            model_path = os.path.join(nlu_dir, model_name)
            if os.path.isdir(model_path):
                try:
                    tokenizer = AutoTokenizer.from_pretrained(model_path)
                    model = AutoModelForSequenceClassification.from_pretrained(model_path)
                    self.nlu_models[model_name] = pipeline(
                        "text-classification",
                        model=model,
                        tokenizer=tokenizer
                    )
                except Exception as e:
                    print(f"Error loading model {model_name}: {str(e)}")
    
    def get_nlu_model(self, model_name):
        if model_name not in self.nlu_models:
            raise KeyError(f"NLU model '{model_name}' not found")
        return self.nlu_models[model_name]
    
    def process_text(self, text, model_name):
        try:
            # Get the appropriate model
            nlu_pipeline = self.get_nlu_model(model_name)
            
            # Get prediction
            result = nlu_pipeline(text)[0]
            
            # Format response
            response = {
                "label": result['label'],
                "confidence": result['score']
            }
            
            return response, 200
            
        except KeyError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            return {"error": f"Processing error: {str(e)}"}, 500

# Initialize the service
nlu_service = NLUService()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    text = data.get('text')
    model_name = data.get('model_name')
    
    if not text or not model_name:
        return jsonify({"error": "Missing required parameters"}), 400
    
    result, status_code = nlu_service.process_text(text, model_name)
    return jsonify(result), status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
import os
import json
import requests
from pathfinder.TrainRouteMapper import TrainRouteMapper
from flask import jsonify, request
from models import db, Sentence

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialize_mapper()
        return cls._instance
    
    def _initialize_mapper(self):
        # Initialize TrainRouteMapper
        stops_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pathfinder', 'tgv', 'stops.txt'))
        stop_times_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pathfinder', 'tgv', 'stop_times.txt'))
        self.mapper = TrainRouteMapper(stops_file, stop_times_file)

class TrainMapperController:
    def __init__(self):
        self.model_manager = ModelManager()
        # Use service names from docker-compose
        self.ner_service_url = "http://ner:5001/predict"
        self.nlu_service_url = "http://nlu:5002/predict"
    
    def process_query(self):
        data = request.json
        text = data.get('text', '').lower()
        nlu_model_name = data.get('nlu')
        ner_model_name = data.get('ner')
        
        # Call NLU service
        try:
            nlu_response = requests.post(
                self.nlu_service_url,
                json={"text": text, "model_name": nlu_model_name},
                timeout=5
            )
            nlu_response.raise_for_status()
            nlu_result = nlu_response.json()
            
            is_travel_related = nlu_result['label'] == 'LABEL_0'
            
            response = {
                "is_travel_related": is_travel_related,
                "confidence": nlu_result['confidence']
            }

            if is_travel_related:
                # Call NER service
                try:
                    ner_response = requests.post(
                        self.ner_service_url,
                        json={"text": text, "model_name": ner_model_name},
                        timeout=5
                    )
                    ner_response.raise_for_status()
                    ner_result = ner_response.json()
                    
                    depart = ner_result.get("departure")
                    arrivee = ner_result.get("arrival")

                    if not depart and not arrivee:
                        response["error"] = "Unable to identify departure and arrival city"
                    elif not depart:
                        response["error"] = f"Found {arrivee} as arrival but unable to identify departure city"
                    elif not arrivee:
                        response["error"] = f"Found {depart} as departure but unable to identify arrival city"
                    else:
                        trip_info = json.loads(self.model_manager.mapper.find_shorter_paths(depart, arrivee))
                        response.update({
                            "departure": depart,
                            "arrival": arrivee,
                            "trip_info": trip_info
                        })
                except requests.RequestException as e:
                    return jsonify({"error": f"NER service error: {str(e)}"}), 500
                    
        except requests.RequestException as e:
            return jsonify({"error": f"NLU service error: {str(e)}"}), 500
        
        if(not "trip_info" in response):
            new_sentence = Sentence(
                text=text,
                is_valid=False,
                is_treated=False
            )
            
            db.session.add(new_sentence)
            db.session.commit()
            
        return jsonify(response)
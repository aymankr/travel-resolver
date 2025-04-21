import spacy
from spacy.training import Example
from spacy.util import minibatch, compounding
import random
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_fscore_support, confusion_matrix
from tqdm import tqdm
import os
import requests
import time
from typing import List, Tuple, Dict
from datetime import timezone, datetime
from collections import Counter

# Configuration
MODEL_OUTPUT_DIR = os.getenv('MODEL_OUTPUT_DIR', './fine_tuned_models/')
API_BASE_URL = "http://back:5000"

def fetch_sentences() -> List[Tuple[str, Dict]]:
    processed_data = []
    page = 1
    per_page = 1000
    has_next = True
    
    while has_next:
        try:
            response = requests.get(
                f"{API_BASE_URL}/sentences",
                params={"page": page, "per_page": per_page, "isValid": True, "isTreated": True}
            )
            response.raise_for_status()
            data = response.json()
            
            items = data.get('items', []) if isinstance(data, dict) else data
            
            print(f"Fetched page {page} ({len(items)} sentences)")
            if not items:
                break
                
            for item in items:
                try:
                    if isinstance(item, dict):
                        text = item.get('text', '')
                        entities = []
                        item_entities = item.get('entities', [])
                        
                        if item_entities:
                            for entity in item_entities:
                                if isinstance(entity, dict):
                                    start = entity.get('start')
                                    end = entity.get('end')
                                    label = entity.get('label')
                                    
                                    if all(v is not None for v in [start, end, label]):
                                        entities.append((start, end, label))
                        
                        if text:
                            processed_data.append((text, {"entities": entities}))
                except Exception as e:
                    print(f"Error processing item: {str(e)}, Item: {item}")
                    continue
                
            pagination = data.get('pagination', {})
            has_next = pagination.get('has_next', False)
            page += 1
            
        except Exception as e:
            print(f"Error fetching sentences: {str(e)}")
            break
    
    print(f"Fetched {len(processed_data)} sentences from API")
    
    if not processed_data:
        raise ValueError("No valid training data was fetched from the API")
    
    return processed_data

def calculate_entity_metrics(nlp, test_data):
    """Calculate detailed metrics for each entity type"""
    y_true = []
    y_pred = []
    
    print("Calculating entity metrics...")
    
    for text, annotations in test_data:
        doc = nlp(text)
        text_length = len(text)
        
        # Create token-level labels
        true_labels = ["O"] * text_length
        pred_labels = ["O"] * text_length
        
        # Fill in true entities
        for start, end, label in annotations["entities"]:
            for i in range(start, end):
                if i < text_length:
                    true_labels[i] = label
        
        # Fill in predicted entities
        for ent in doc.ents:
            for i in range(ent.start_char, ent.end_char):
                if i < text_length:
                    pred_labels[i] = ent.label_
        
        # Collect all non-O labels
        for true_label, pred_label in zip(true_labels, pred_labels):
            if true_label != "O" or pred_label != "O":
                y_true.append(true_label)
                y_pred.append(pred_label)
    
    # Handle empty case
    if not y_true or not y_pred:
        print("Warning: No entities found in evaluation")
        return {
            "departure_metrics": {
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
                "support": 0
            },
            "arrival_metrics": {
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
                "support": 0
            },
            "confusion_matrix": [[0, 0], [0, 0]]
        }
    
    print(f"Total labels collected - True: {len(y_true)}, Predicted: {len(y_pred)}")
    
    # Calculate metrics for each entity type
    labels = ["DEPARTURE", "ARRIVAL"]
    
    try:
        precision, recall, f1, support = precision_recall_fscore_support(
            y_true, y_pred, 
            labels=labels, 
            average=None, 
            zero_division=0
        )
        
        # Create confusion matrix and convert to list of lists
        cm = confusion_matrix(
            y_true, y_pred, 
            labels=labels
        ).tolist()  # Convert to regular Python list
        
        metrics = {
            "departure_metrics": {
                "precision": float(precision[0]),
                "recall": float(recall[0]),
                "f1": float(f1[0]),
                "support": int(support[0])
            },
            "arrival_metrics": {
                "precision": float(precision[1]),
                "recall": float(recall[1]),
                "f1": float(f1[1]),
                "support": int(support[1])
            },
            "confusion_matrix": cm  # Now a list of lists
        }
        
        print("Successfully calculated metrics")
        return metrics
        
    except Exception as e:
        print(f"Error in metric calculation: {str(e)}")
        print(f"Unique true labels: {set(y_true)}")
        print(f"Unique predicted labels: {set(y_pred)}")
        print(f"Label counts - True: {dict(Counter(y_true))}")
        print(f"Label counts - Predicted: {dict(Counter(y_pred))}")
        
        return {
            "departure_metrics": {
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
                "support": 0
            },
            "arrival_metrics": {
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
                "support": 0
            },
            "confusion_matrix": [[0, 0], [0, 0]]
        }

def create_model_record(metrics_data: Dict):
    """Create a new model record via API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/models",
            json=metrics_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating model record via API: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response content: {e.response.text}")
        return None

def test_model(nlp, test_data, silent=False):
    """Test the trained model"""
    correct_predictions = 0
    total_predictions = 0
    
    iterator = test_data
    if not silent:
        iterator = tqdm(test_data, desc="Testing Progress")
        
    for text, annotations in iterator:
        doc = nlp(text)
        predicted_entities = [(ent.text, ent.label_) for ent in doc.ents]
        true_entities = [
            (text[start:end], label) 
            for start, end, label in annotations["entities"]
        ]
        
        predicted_entities.sort()
        true_entities.sort()
        
        if predicted_entities == true_entities:
            correct_predictions += 1
        total_predictions += 1
    
    accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
    if not silent:
        print(f"\nOverall Accuracy: {accuracy:.4f}")
    return accuracy

def train_ner(model_name, train_data, test_data, n_iter=10):
    """Train the NER model and track metrics"""
    start_time = time.time()
    nlp = spacy.load(model_name)
    
    # Add NER pipe if it doesn't exist
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner", last=True)
    else:
        ner = nlp.get_pipe("ner")

    # Add labels and count entity distribution
    entity_distribution = {"DEPARTURE": 0, "ARRIVAL": 0}
    for _, annotations in train_data:
        for ent in annotations.get("entities", []):
            ner.add_label(ent[2])
            entity_distribution[ent[2]] = entity_distribution.get(ent[2], 0) + 1

    # Training configuration
    batch_size_min = 4.0
    batch_size_max = 32.0
    dropout_rate = 0.5
    learning_rate = 0.001

    # Training history
    training_history = {"loss": [], "accuracy": []}

    # Train the model
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
    with nlp.disable_pipes(*other_pipes):
        optimizer = nlp.begin_training()
        
        with tqdm(total=n_iter, desc="Training Progress") as pbar:
            for itn in range(n_iter):
                random.shuffle(train_data)
                losses = {}
                
                batches = minibatch(train_data, size=compounding(batch_size_min, batch_size_max, 1.001))
                
                for batch in batches:
                    examples = []
                    for text, annotations in batch:
                        doc = nlp.make_doc(text)
                        example = Example.from_dict(doc, annotations)
                        examples.append(example)
                    
                    nlp.update(examples, drop=dropout_rate, losses=losses)
                
                # Track training history
                current_loss = float(losses.get("ner", 0))
                training_history["loss"].append(current_loss)
                
                # Calculate accuracy for this iteration
                current_accuracy = test_model(nlp, test_data, silent=True)
                training_history["accuracy"].append(float(current_accuracy))
                
                pbar.update(1)
                pbar.set_postfix(losses=losses)

    training_time = time.time() - start_time
    
    # Calculate final metrics
    final_accuracy = test_model(nlp, test_data)
    entity_metrics = calculate_entity_metrics(nlp, test_data)

    confusion_matrix_dict = {
        "matrix": entity_metrics["confusion_matrix"],
        "labels": ["DEPARTURE", "ARRIVAL"]
    }
    
    model_data = {
        "name": f"NER_Model_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M')}",
        "type": "NER",
        "version": "1.0",
        "description": "French NER model for DEPARTURE and ARRIVAL entities",
        "base_model": model_name,
        "train_data_count": len(train_data),
        "test_data_count": len(test_data),
        "training_time": training_time,
        "iterations": n_iter,
        "batch_size_min": float(batch_size_min),
        "batch_size_max": float(batch_size_max),
        "dropout_rate": float(dropout_rate),
        "learning_rate": float(learning_rate),
        "optimizer": "adam",
        "accuracy": float(final_accuracy),
        "loss": float(training_history["loss"][-1]) if training_history["loss"] else None,
        
        # Entity metrics
        "departure_metrics": entity_metrics["departure_metrics"],
        "arrival_metrics": entity_metrics["arrival_metrics"],
        
        # Additional data - ensure all are JSON compatible
        "confusion_matrix": confusion_matrix_dict,
        "entity_distribution": dict(entity_distribution),  # Convert to regular dict
        "training_history": {
            "loss": [float(x) for x in training_history["loss"]],
            "accuracy": [float(x) for x in training_history["accuracy"]]
        }
    }
    
    # Create model record via API
    model_record = create_model_record(model_data)
    
    return nlp, model_record

if __name__ == "__main__":
    try:
        # Fetch and prepare data
        all_data = fetch_sentences()
        
        if not all_data:
            raise ValueError("No training data received from API")
            
        train_data, test_data = train_test_split(all_data, test_size=0.1, random_state=42)
        print(f"Training data size: {len(train_data)}")
        print(f"Test data size: {len(test_data)}")
        
        # Train and evaluate model
        print("\nStarting model training...")
        trained_model, model_record = train_ner(
            "fr_core_news_lg",
            train_data,
            test_data
        )

        # Create output directory
        os.makedirs(MODEL_OUTPUT_DIR+model_record.get('name'), exist_ok=True)
        # Save the trained model
        trained_model.to_disk(MODEL_OUTPUT_DIR+model_record.get('name'))
        
        if model_record:
            print("\nTraining completed successfully!")
            print(f"Model saved to disk at: {MODEL_OUTPUT_DIR}")
            print(f"Model record created with ID: {model_record.get('id')}")
            print("\nModel metrics:")
            print(f"Accuracy: {model_record.get('accuracy', 0):.4f}")
            print(f"Training time: {model_record.get('training_time', 0):.2f} seconds")
            print(f"DEPARTURE F1: {model_record.get('departure_metrics', {}).get('f1', 0):.4f}")
            print(f"ARRIVAL F1: {model_record.get('arrival_metrics', {}).get('f1', 0):.4f}")
        else:
            print("\nWarning: Training completed but failed to create model record!")
            print(f"Model saved to disk at: {MODEL_OUTPUT_DIR}")
            
    except Exception as e:
        print(f"\nError during training process: {str(e)}")
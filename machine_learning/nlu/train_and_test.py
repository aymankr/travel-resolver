from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset
import requests
from typing import List, Dict
from sklearn.model_selection import train_test_split
import numpy as np
import evaluate
from sklearn.metrics import precision_recall_fscore_support, confusion_matrix
from collections import Counter
from datetime import datetime, timezone
import time
import os

API_BASE_URL = "http://back:5000"
OUTPUT_DIR = os.getenv('MODEL_OUTPUT_DIR', './fine_tuned_models/')

def compute_metrics(eval_pred):
    metric = evaluate.load("accuracy")
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)

def fetch_all_sentences(api_base_url: str, is_trip: bool, per_page: int = 100) -> List[str]:
    sentences = []
    page = 1
    has_next = True
    
    while has_next:
        response = requests.get(
            f"{api_base_url}/sentences",
            params={
                "page": page,
                "per_page": per_page,
                "isValid": is_trip,
                "isTreated": True
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"API request failed with status {response.status_code}")
            
        data = response.json()
        items = data.get('items', [])
        sentences.extend([item['text'] for item in items])
        
        pagination = data.get('pagination', {})
        has_next = pagination.get('has_next', False)
        page += 1
        
        print(f"Fetched page {page-1} ({len(items)} sentences)")
    
    return sentences

def prepare_datasets(api_base_url: str, test_size: float = 0.2) -> tuple[Dataset, Dataset]:
    print("Fetching trip-related sentences...")
    trip_sentences = fetch_all_sentences(api_base_url, is_trip=True)
    print(f"Found {len(trip_sentences)} trip-related sentences")
    
    print("Fetching non-trip sentences...")
    non_trip_sentences = fetch_all_sentences(api_base_url, is_trip=False)
    print(f"Found {len(non_trip_sentences)} non-trip sentences")
    
    all_sentences = trip_sentences + non_trip_sentences
    labels = [0] * len(trip_sentences) + [1] * len(non_trip_sentences)
    
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        all_sentences, labels, test_size=test_size, random_state=42, stratify=labels
    )
    
    train_dataset = Dataset.from_dict({"text": train_texts, "label": train_labels})
    test_dataset = Dataset.from_dict({"text": test_texts, "label": test_labels})
    
    return train_dataset, test_dataset

def calculate_nlu_metrics(trainer, test_dataset):
    """Calculate detailed metrics for NLU classification"""
    predictions = trainer.predict(test_dataset)
    y_true = test_dataset["label"]
    y_pred = np.argmax(predictions.predictions, axis=1)
    
    try:
        precision, recall, f1, support = precision_recall_fscore_support(
            y_true, y_pred,
            labels=[0, 1],
            average=None,
            zero_division=0
        )
        
        cm = confusion_matrix(
            y_true, y_pred,
            labels=[0, 1]
        ).tolist()
        
        metrics = {
            "travel_metrics": {
                "precision": float(precision[0]),
                "recall": float(recall[0]),
                "f1": float(f1[0]),
                "support": int(support[0])
            },
            "non_travel_metrics": {
                "precision": float(precision[1]),
                "recall": float(recall[1]),
                "f1": float(f1[1]),
                "support": int(support[1])
            },
            "confusion_matrix": cm
        }
        
        print("Successfully calculated metrics")
        return metrics
        
    except Exception as e:
        print(f"Error in metric calculation: {str(e)}")
        print(f"Label counts - True: {dict(Counter(y_true))}")
        print(f"Label counts - Predicted: {dict(Counter(y_pred))}")
        return {
            "travel_metrics": {"precision": 0.0, "recall": 0.0, "f1": 0.0, "support": 0},
            "non_travel_metrics": {"precision": 0.0, "recall": 0.0, "f1": 0.0, "support": 0},
            "confusion_matrix": [[0, 0], [0, 0]]
        }

def create_nlu_model_record(metrics_data: Dict, training_info: Dict):
    model_name = f"NLU_Model_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M')}"
    model_data = {
        "name": model_name,
        "type": "NLU",
        "version": "1.0",
        "description": "French NLU model for travel intent classification",
        "base_model": "camembert-base",
        "train_data_count": training_info["train_count"],
        "test_data_count": training_info["test_count"],
        "training_time": training_info["training_time"],
        "iterations": training_info["num_epochs"],
        "batch_size_min": float(training_info["batch_size"]),
        "batch_size_max": float(training_info["batch_size"]),
        "dropout_rate": 0.1,
        "learning_rate": float(training_info["learning_rate"]),
        "optimizer": "AdamW",
        "accuracy": float(metrics_data["travel_metrics"]["f1"]),
        "confusion_matrix": {
            "matrix": metrics_data["confusion_matrix"],
            "labels": ["TRAVEL", "NON_TRAVEL"]
        },
        'additional_metrics': metrics_data
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/models",
            json=model_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating NLU model record: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response content: {e.response.text}")
        return None, model_name

def main():
    MODEL_NAME = "camembert-base"
    
    start_time = time.time()

    print("Preparing datasets...")
    train_dataset, test_dataset = prepare_datasets(API_BASE_URL)
    train_count = len(train_dataset)
    test_count = len(test_dataset)
    print(f"Train dataset size: {len(train_dataset)}")
    print(f"Test dataset size: {len(test_dataset)}")
    
    print("Loading tokenizer and model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True)
    
    print("Tokenizing datasets...")
    tokenized_train_dataset = train_dataset.map(tokenize_function, batched=True)
    tokenized_test_dataset = test_dataset.map(tokenize_function, batched=True)
    
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=3,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir="./logs",
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train_dataset,
        eval_dataset=tokenized_test_dataset,
        compute_metrics=compute_metrics,
    )
    
    print("Starting training...")
    trainer.train()
    
    print("Calculating metrics...")
    metrics = calculate_nlu_metrics(trainer, tokenized_test_dataset)

    training_time = time.time() - start_time

    training_info = {
        "train_count": train_count,
        "test_count": test_count,
        "training_time": training_time,
        "num_epochs": training_args.num_train_epochs,
        "batch_size": training_args.per_device_train_batch_size,
        "learning_rate": training_args.learning_rate
    }

    print("Storing model record...")
    model_record = create_nlu_model_record(metrics, training_info)
    
    print("Saving model...")
    os.makedirs(os.path.join(OUTPUT_DIR, model_record.get('name')), exist_ok=True)
    model.save_pretrained(os.path.join(OUTPUT_DIR, model_record.get('name')))
    tokenizer.save_pretrained(os.path.join(OUTPUT_DIR, model_record.get('name')))
    
    if model_record:
        print("\nTraining completed successfully!")
        print(f"Model saved to disk at: {os.path.join(OUTPUT_DIR, model_record.get('name'))}")
        print(f"Model record created with ID: {model_record.get('id')}")
        print("\nModel metrics:")
        print(f"Training time: {training_info['training_time']:.2f} seconds")
    else:
        print("\nWarning: Training completed but failed to create model record!")
        print(f"Model saved to disk at: {os.path.join(OUTPUT_DIR, model_record.get('name'))}")

if __name__ == "__main__":
    main()
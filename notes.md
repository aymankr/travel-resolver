# Notes

## Follow up 1 (10/10/2024)

- [ ] NLU
- [ ] Scoring sur les mots de la phrase

### Notes ###

NER:

###
Dataset with 50000 sentences has been generated and saved to french_travel_dataset.json. (4 secondes)

Training data size: 45000
Test data size: 5000

1:51:27

Overall Accuracy: 0.9992
###

###
With open ai
num_sentences = 5000
batch_size = 50


NLU:

Nombre de phrases: 375
Dataset size: 375
Number of trip-related sentences: 193
Number of non-trip related sentences: 182

environ 2h

## Follow up 2 (07/11/2024)

- [ ] Ajouter le BO (back office) pour les phrases incomprises
- [ ] Ajouter automatiquement les phrases avec un score inférieur à x dans les phrases incomprises ?
- [ ] Utiliser le GPU pour le NLU (performances accrues)
- [ ] Faire de la veille sur le hardware (GPU, CPU, calculs parallèles, etc...)
- [ ] Penser industrialisation pour l'architecture du projet (hardware, docker, déploiement, etc...)
- [ ] Trier les trajets par temps de trajet sur l'interface web et revoir le wording (plus d'explications sur les trajets passant par d'autres villes ?)
- [ ] Afficher la phrase comprise par le STT (speech to text) sur l'interface web
- [ ] Ajouter un TTS (text to speech) comme WhisperSpeech ?
- [ ] Traitement d'abord avec Levenstein (sans les villes, si match utiliser la phrase template avec les villes) -> NLU -> NER

import HttpRequest from "../../services/HttpRequest";

class WhisperApi {
    static subscribers = []; // Liste des abonnés

    /**
     * Transcrit un fichier audio en texte.
     * @param {FormData} formData - FormData contenant le fichier audio.
     * @returns {Promise<Object>} - Réponse contenant la transcription.
     */
    static async transcribe(formData) {
        try {
            const response = await HttpRequest.post("/whisper/transcribe", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response;
        } catch (error) {
            console.error("Whisper API error during transcription:", error);
            return { error: "Failed to connect to Whisper service." };
        }
    }

    /**
     * Vérifie la disponibilité du service Whisper.
     * @returns {Promise<boolean>} - True si le service est prêt, False sinon.
     */
    static async isServiceAvailable() {
        try {
            console.log("Sending health check to Whisper service...");
            const response = await HttpRequest.get("/whisper/health");
    
            // Vérifiez directement si le champ 'status' contient 'ready'
            if (response?.status === "ready") {
                console.log("Whisper service is ready.");
                return true;
            }
    
            console.warn("Whisper service is not ready. Status:", response?.status);
            return false;
        } catch (error) {
            console.error("Error during health check:", error);
            return false;
        }
    }
    
    

    /**
     * Abonne un composant à l'état de disponibilité du service.
     * @param {Function} callback - Fonction appelée quand l'état change.
     */
    static subscribe(callback) {
        WhisperApi.subscribers.push(callback);
    }

    /**
     * Désabonne un composant de l'état de disponibilité du service.
     * @param {Function} callback - Fonction à désabonner.
     */
    static unsubscribe(callback) {
        WhisperApi.subscribers = WhisperApi.subscribers.filter((cb) => cb !== callback);
    }

    /**
     * Notifie tous les abonnés du changement d'état.
     * @param {boolean} available - État actuel de disponibilité.
     */
    static notifySubscribers(available) {
        WhisperApi.subscribers.forEach((callback) => callback(available));
    }
}

export default WhisperApi;

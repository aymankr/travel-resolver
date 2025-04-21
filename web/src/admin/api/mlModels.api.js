import HttpRequest from "../../services/HttpRequest";

class MlModelsApi {
    static async paginate(params = {}) {
        return HttpRequest.get('/models', { params });
    }

    static async get(id) {
        return HttpRequest.get(`/models/${id}`);
    }

    static async getStats() {
        return HttpRequest.get('/models/stats');
    }
}

export default MlModelsApi;
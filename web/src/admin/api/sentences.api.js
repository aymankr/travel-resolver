import HttpRequest from "../../services/HttpRequest";

class SentencesApi {
    static async getStats() {
        return HttpRequest.get('/sentences/stats');
    }

    static async paginate(params = {}) {
        return HttpRequest.get('/sentences', { params });
    }

    static async update(id, data) {
        return HttpRequest.put(`/sentences/${id}`, data);
    }

    static async get(id) {
        return HttpRequest.get(`/sentences/${id}`);
    }
}

export default SentencesApi;
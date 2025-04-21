import HttpRequest from "../../services/HttpRequest";

class CitiesApi {
    static async getStats() {
        return HttpRequest.get('/cities/stats');
    }

    static async paginate(params = {}) {
        return HttpRequest.get('/cities', { params });
    }

    static async create(data) {
        return HttpRequest.post('/cities', data);
    }

    static async delete(id) {
        return HttpRequest.delete(`/cities/${id}`);
    }
}

export default CitiesApi;
import HttpRequest from "../../services/HttpRequest";

class MlModelsApi {
    static async getAll() {
        return HttpRequest.get('/models/all');
    }
}

export default MlModelsApi;
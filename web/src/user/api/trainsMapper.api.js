import HttpRequest from "../../services/HttpRequest";

class TrainsMapperApi {
    static async findTrips(data) {
        return HttpRequest.post('/process_query', data);
    }
}

export default TrainsMapperApi;
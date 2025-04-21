import HttpRequest from "../../services/HttpRequest";

class UsersApi {
    static async getByToken(data) {
        return HttpRequest.post('/user', data);
    }
}

export default UsersApi;
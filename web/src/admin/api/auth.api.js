import HttpRequest from "../../services/HttpRequest";

class AuthApi {
    static async login(data) {
        return HttpRequest.post('/login', data);
    }

    static async register(data) {
        return HttpRequest.post('/register', data);
    }
}

export default AuthApi;
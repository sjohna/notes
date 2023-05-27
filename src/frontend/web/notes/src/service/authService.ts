import {environment} from "../environment/environment";
import {navigate, stateAfterLogin} from "./navigationService";
import {TagService} from "./tagService";
import {GroupService} from "./groupService";

let token: string = null;

export { token }

export class AuthService {
    constructor(private tags: TagService, private groups: GroupService) {

    }

    public login(userName: string, password: string) {
        const body = {
            userName,
            password
        }

        fetch(`${environment.apiUrl}/auth/login`, {
            'method': 'POST',
            'body': JSON.stringify(body)
        })
            .then(async (response) => {
                const data = await response.json();

                localStorage.setItem('authToken', data.token);

                token = data.token;

                this.tags.get();
                this.groups.get();

                if (stateAfterLogin) {
                    navigate(stateAfterLogin.path, stateAfterLogin.mainViewTab)
                } else {
                    navigate('/notes', 'notes');
                }
            })
            .catch(err => console.log(err))
    }
}
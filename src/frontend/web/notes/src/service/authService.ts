import {environment} from "../environment/environment";
import {TagService} from "./tagService";
import {GroupService} from "./groupService";
import {BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, Subject} from "rxjs";

let token: string = null;

export { token }

export class AuthService {
    private loggedIn$$ = new BehaviorSubject<boolean>(false);
    public loggedInChanged$: Observable<boolean> = this.loggedIn$$.pipe(distinctUntilChanged());

    private forceLogout$$ = new Subject();
    public forceLogout$ = this.forceLogout$$.asObservable();

    constructor() {}

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

                this.loggedIn$$.next(true);
            })
            .catch(err => console.log(err))
    }

    public async post(url: string, body?: any): Promise<Response> {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.ok) {
            return response;
        }

        if (response.status === 401) {
            console.log('Unauthorized, flagging as logged out')
            if (this.loggedIn$$.value) {
                this.loggedIn$$.next(false);
                this.forceLogout$$.next(null);
            }
        }

        // TODO: handle errors here
        throw new Error(`Error posting to ${url}: ${response.status} ${response.statusText}`);
    }

    public changesWhileLoggedIn<T>(obs: Observable<T>): Observable<T> {
        return combineLatest([obs, this.loggedInChanged$]).pipe(
            filter(([_, loggedIn]) => loggedIn),
            map(([value, _]) => value),
        )
    }
}
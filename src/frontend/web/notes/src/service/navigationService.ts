import {BehaviorSubject, Subject} from "rxjs";
import {AuthService} from "./authService";

export interface NavigateEvent {
    loggedIn: boolean;
    path: string;
    mainViewTab: string;
}

const notLoggedInState: NavigateEvent = {
    loggedIn: false,
    path: '/',
    mainViewTab: 'login',
}

const defaultLoggedInState: NavigateEvent = {
    loggedIn: true,
    path: '/notes',
    mainViewTab: 'notes',
}

export class NavigationService {
    private navigationEvents$$ = new BehaviorSubject<NavigateEvent>(notLoggedInState);
    public navigationEvents$ = this.navigationEvents$$.asObservable();

    private stateAfterLogin: NavigateEvent = null;

    constructor(private authService: AuthService) {
        this.authService.forceLogout$.subscribe(() => {
            const currentState = this.navigationEvents$$.value;

            if (currentState.loggedIn) {
                this.stateAfterLogin = currentState;
            } else {
                this.stateAfterLogin = defaultLoggedInState;
            }

            history.replaceState(notLoggedInState, '', '/login');
            this.navigationEvents$$.next(notLoggedInState);
        });

        this.authService.loggedInChanged$.subscribe((loggedIn) => {
            if (loggedIn) {
                this.navigate(this.stateAfterLogin.path, this.stateAfterLogin.mainViewTab, true);
            }
        });
    }

    public navigate(path: string, mainViewTab: string, loggedIn: boolean = true) {
        const navEvent = {
            loggedIn: true,
            path,
            mainViewTab,
        }

        history.pushState(navEvent, '', path);

        this.navigationEvents$$.next(navEvent);
    }

    public historyPopped(event: NavigateEvent) {
        this.navigationEvents$$.next(event);
    }

    public setInitialStateFromURL() {
        let path = window.location.pathname;
        let mainViewTab = path.split('/')[1];

        if (mainViewTab !== 'notes' && mainViewTab !== 'tags' && mainViewTab !== 'groups') {
            mainViewTab = 'notes';
            path = '/notes';
        }

        const initialState = {
            loggedIn: true,
            path,
            mainViewTab,
        }

        if (this.authService.isLoggedIn()) {
            history.replaceState(initialState, '', path)

            this.navigationEvents$$.next(initialState);
        } else {
            this.stateAfterLogin = initialState;

            console.log(this.stateAfterLogin)

            history.replaceState(notLoggedInState, '', '/login');
            this.navigationEvents$$.next(notLoggedInState);
        }
    }
}
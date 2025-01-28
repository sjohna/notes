import {BehaviorSubject, filter, Subject} from "rxjs";
import {AuthService} from "./authService";
import {not} from "rxjs/internal/util/not";

export type MainView = 'login' | 'note' | 'tag' | 'group'

export interface NavigationState {
    mainView: MainView;
    id?: number;
}

export interface NavigationEvent {
    loggedIn: boolean;
    path: string;
    state: NavigationState;
}

const notLoggedInState: NavigationState = {
    mainView: 'login',
}

const defaultState: NavigationState = {
    mainView: 'note',
}

export function pathFromNavigationState(state: NavigationState): string {
    let path = '/' + state.mainView;
    if (state.id) {
        path += '/' + state.id;
    }

    return path;
}

export function navigationStateFromPath(path: string): NavigationState {
    console.log(path);
    const pathTokens = path.split('/');

    if (pathTokens?.length < 2) {
        return defaultState;
    }

    // get main view
    let mainView = pathTokens[1];

    if (mainView !== 'note' && mainView !== 'tag' && mainView !== 'group') {
        return defaultState;
    }

    let id: number | null = null;

    if (pathTokens.length > 2) {
        id = Number(pathTokens[2]);
        if (id <= 0) {
            id = null;
        }
    }

    return {
        mainView,
        id
    }
}

export class NavigationService {
    private navigationEvents$$ = new BehaviorSubject<NavigationEvent>(null);
    public navigationEvents$ = this.navigationEvents$$.pipe(filter((event) => !!event))

    // TODO: why did this break all of the sudden?
    private stateAfterLogin: NavigationState = defaultState;

    private initialized = false;

    constructor(private authService: AuthService) {
        this.stateAfterLogin = navigationStateFromPath(window.location.pathname);

        this.authService.forceLogout$.subscribe(() => {
            console.log('force logout')
            const currentEvent = this.navigationEvents$$.value;

            if (currentEvent?.loggedIn && currentEvent?.state) {
                this.stateAfterLogin = currentEvent.state;
            } else {
                this.stateAfterLogin = defaultState;
            }

            this.navigateToState(notLoggedInState);
        });

        this.authService.loggedInChanged$.subscribe((loggedIn) => {
            console.log('logged in changed')
            if (!this.initialized) {
                return
            }

            if (loggedIn) {
                this.navigateToState(this.stateAfterLogin)
            } else {
                this.navigateToState(notLoggedInState)
            }
        });

        if (this.authService.isLoggedIn()) {
            this.replaceState(this.stateAfterLogin);
        } else {
            this.replaceState(notLoggedInState);
        }
    }

    private pushState(state: NavigationState) {
        const path = pathFromNavigationState(state);
        history.pushState(state, '', path);
        this.navigateToState(state);
    }

    private replaceState(state: NavigationState) {
        const path = pathFromNavigationState(state);
        history.replaceState(state, '', path);
        this.navigateToState(state);
    }

    private navigateToState(state: NavigationState) {
        const path = pathFromNavigationState(state);    // TODO: eliminate redundancy
        const event: NavigationEvent = {
            loggedIn: true,
            path,
            state
        }

        this.navigationEvents$$.next(event);
    }

    public navigate(mainView: MainView, id?: number) {
        const navState = {
            mainView,
            id,
        }

        this.pushState(navState);
    }

    public historyPopped(state: NavigationState) {
        console.log('history popped')

        this.navigateToState(state);
    }
}
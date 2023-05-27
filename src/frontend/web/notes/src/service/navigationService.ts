import {BehaviorSubject, Subject} from "rxjs";

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

const navigationEvents$$ = new BehaviorSubject<NavigateEvent>(notLoggedInState);
export const navigationEvents$ = navigationEvents$$.asObservable();

export function navigate(path: string, mainViewTab: string) {
    const navEvent = {
        loggedIn: true,
        path,
        mainViewTab,
    }

    history.pushState(navEvent, '', path);

    navigationEvents$$.next(navEvent);
}

window.onpopstate =  (event) => {
    navigationEvents$$.next(event.state);
};

let stateAfterLogin: NavigateEvent = null;

export {stateAfterLogin};

export function setInitialStateFromURL() {

    let path = window.location.pathname;
    let mainViewTab = path.split('/')[1];

    if (mainViewTab !== 'notes' && mainViewTab !== 'tags' && mainViewTab !== 'groups') {
        mainViewTab = 'notes';
        path = '/notes';
    }

    stateAfterLogin = {
        loggedIn: true,
        path,
        mainViewTab,
    }

    history.replaceState(notLoggedInState, '', '/login');

    navigationEvents$$.next(notLoggedInState);
}

export function redirectToLogin() {
    stateAfterLogin = navigationEvents$$.value;

    navigationEvents$$.next(notLoggedInState);
}
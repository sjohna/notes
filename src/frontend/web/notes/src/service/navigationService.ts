import {BehaviorSubject, Subject} from "rxjs";

export interface NavigateEvent {
    loggedIn: boolean;
    path: string;
    mainViewTab: string;
}

const defaultNavEvent: NavigateEvent = {
    loggedIn: false,
    path: '/',
    mainViewTab: 'login',
}

const navigationEvents$$ = new BehaviorSubject<NavigateEvent>(defaultNavEvent);
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

export function setInitialStateFromURL() {

    // let path = window.location.pathname;
    // let mainViewTab = path.split('/')[1];
    //
    // if (mainViewTab !== 'notes' && mainViewTab !== 'tags' && mainViewTab !== 'groups') {
    //     mainViewTab = 'notes';
    //     path = '/notes';
    // }

    const initialState: NavigateEvent = {
        loggedIn: false,
        path: '/login',
        mainViewTab: null,
    }

    history.replaceState(initialState, '', '/login');

    navigationEvents$$.next(initialState);
}
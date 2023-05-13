import {BehaviorSubject, Subject} from "rxjs";

export interface NavigateEvent {
    path: string;
    mainViewTab: string;
}

const defaultNavEvent: NavigateEvent = {
    path: '/',
    mainViewTab: 'notes',
}

const navigationEvents$$ = new BehaviorSubject<NavigateEvent>(defaultNavEvent);
export const navigationEvents$ = navigationEvents$$.asObservable();

export function navigate(path: string, mainViewTab: string) {
    const navEvent = {
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
    let path = window.location.pathname;
    let mainViewTab = path.split('/')[1];

    if (mainViewTab !== 'notes' && mainViewTab !== 'tags' && mainViewTab !== 'groups') {
        mainViewTab = 'notes';
        path = '/notes';
    }

    const initialState: NavigateEvent = {
        path,
        mainViewTab,
    }

    history.replaceState(initialState, '', path);

    navigationEvents$$.next(initialState);
}
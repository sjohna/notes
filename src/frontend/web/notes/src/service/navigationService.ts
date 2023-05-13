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

    console.log('Navigating to: ' + path)
    console.log('Main view tab: ' + mainViewTab)
    history.pushState(navEvent, '', path);

    navigationEvents$$.next(navEvent);
}

export function registerPopStateHandler() {
    window.onpopstate =  (event) => {
        console.log('Popping state');
        console.log(event.state);
        navigationEvents$$.next(event.state);
    };
}

export function setInitialStateFromURL() {
    console.log(window.location.pathname);
    let path = window.location.pathname;
    let mainViewTab = path.split('/')[1];

    if (mainViewTab !== 'notes' && mainViewTab !== 'tags' && mainViewTab !== 'groups') {
        mainViewTab = 'notes';
        path = '/notes';
    }

    if (mainViewTab === 'groups') {
        mainViewTab = 'documentGroups';
    }

    const initialState: NavigateEvent = {
        path,
        mainViewTab,
    }

    history.replaceState(initialState, '', path);

    navigationEvents$$.next(initialState);
}

export abstract class PathElement {
    abstract matches(pathPart: string): {match: boolean, data?: any};
}

export class SimplePathElement extends PathElement {
    constructor(private pathElement: string) {
        super();
    }

    public matches(pathPart: string): {match: boolean, data?: any} {
        return {
            match: pathPart === this.pathElement,
        }
    }
}

export class NumberParameterPathElement extends PathElement {
    constructor(private paramName: string) {
        super();
    }

    public matches(pathPart: string): {match: boolean, data?: any} {
        const value = parseInt(pathPart);
        if (isNaN(value)) {
            return {
                match: false,
            }
        } else {
            return {
                match: true,
                data: {
                    [this.paramName]: value,
                },
            }
        }
    }
}

export class StringParameterPathElement extends PathElement {
    constructor(private paramName: string) {
        super();
    }

    public matches(pathPart: string): {match: boolean, data?: any} {
        if (pathPart.trim() === '') {
            return {
                match: false,
            }
        }

        return {
            match: true,
            data: {
                [this.paramName]: pathPart,
            },
        }
    }
}

export interface Route {
    path: PathElement[];
    data?: any;
    subRoutes?: Route[];
}

export interface NavState {
    path: string[];
    data?: any;
    subState?: NavState;
}

// TODO: may need to handle collision between parameter and non-parameter routes
export function matchRoute(route: Route, path: string[]): {match: boolean, data?: any, remainingPath?: string[]} {
    if (path.length < route.path.length) {
        return {
            match: false,
        }
    }

    let data = route.data;

    for (let i = 0; i < route.path.length; i++) {
        const pathElement = route.path[i];
        const pathPart = path[i];
        const match = pathElement.matches(pathPart);
        if (!match.match) {
            return {
                match: false,
            }
        }

        data = {...data, ...match.data};
    }

    return {
        match: true,
        data,
        remainingPath: path.slice(route.path.length),
    }
}
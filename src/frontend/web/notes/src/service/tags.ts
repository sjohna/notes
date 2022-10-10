import {BehaviorSubject, shareReplay} from "rxjs";

export interface Tag {
    id: number;
    name: string;
    description?: string;
    color: string;
}

const tags$$ = new BehaviorSubject<Tag[]>([])
export const tags$ = tags$$.pipe(shareReplay(1));

export function fetchTags() {
    fetch('http://localhost:3000/tag', {
        'method': 'GET'
    })
        .then(async response => tags$$.next(await response.json() as Tag[]))
        .catch(err => console.log(err))
}
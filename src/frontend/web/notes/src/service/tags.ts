import {BehaviorSubject, shareReplay} from "rxjs";
import {environment} from "../environment/environment";

export interface Tag {
    id: number;
    name: string;
    description?: string;
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

export function createTag(name: string, description?: string) {
    if (!name) {
        return;
    }
    
    fetch(`${environment.apiUrl}/tag`, {
        'method': 'POST',
        'body': JSON.stringify({name, description})
    })
        .then(() => {
            fetchTags();
        } )
        .catch(err => console.log(err))
}
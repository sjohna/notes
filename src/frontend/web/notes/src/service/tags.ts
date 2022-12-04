import {BehaviorSubject, shareReplay} from "rxjs";
import {environment} from "../environment/environment";
import {LocalDate} from "@js-joda/core";
import {fetchQuickNotes, fetchQuickNotesInDateRange} from "./quickNotes";

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

export function createTag(name: string, color: string, description?: string) {
    if (!name || !color) {
        return;
    }

    // how is an undefined description going to be handled here?
    fetch(`${environment.apiUrl}/tag`, {
        'method': 'POST',
        'body': JSON.stringify({name, description, color})
    })
        .then(() => {
            fetchTags();
        } )
        .catch(err => console.log(err))
}
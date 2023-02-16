import {BehaviorSubject, shareReplay} from "rxjs";
import {Document} from "./quickNotes";
import {environment} from "../environment/environment";
import {documentUpdated$$} from "./quickNotes";

export interface Tag {
    id: number;
    name: string;
    description?: string;
}

const TAG_UPDATE_ADD = 1;
const TAG_UPDATE_REMOVE = 2;

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

export function addTagToDocument(tagId: number, documentId: number) {
    const body = {
        documentId,
        tagUpdates: [
            {
                tagId,
                updateType: TAG_UPDATE_ADD,
            }
        ]
    }

    fetch(`${environment.apiUrl}/quicknote/update_tags`, {
        'method': 'POST',
        'body': JSON.stringify(body)
    })
        .then(async (response) => {
            documentUpdated$$.next(await response.json() as Document)
        })
        .catch(err => console.log(err))
}

export function removeTagFromDocument(tagId: number, documentId: number) {
    const body = {
        documentId,
        tagUpdates: [
            {
                tagId,
                updateType: TAG_UPDATE_REMOVE,
            }
        ]
    }

    fetch(`${environment.apiUrl}/quicknote/update_tags`, {
        'method': 'POST',
        'body': JSON.stringify(body)
    })
        .then(async (response) => {
            documentUpdated$$.next(await response.json() as Document)
        })
        .catch(err => console.log(err))
}
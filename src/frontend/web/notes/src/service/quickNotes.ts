import {BehaviorSubject, shareReplay} from "rxjs";

export interface Document {
    content: string;
    createdAt: string;
    id: number;
    type: string;
}

const quickNotes$$ = new BehaviorSubject<Document[]>([]);
export const quickNotes$ = quickNotes$$.pipe(shareReplay(1));

export function fetchQuickNotes() {
    fetch('http://localhost:3000/quicknote', {
        'method': 'GET'
    })
        .then(async response => quickNotes$$.next(await response.json() as Document[]))
        .catch(err => console.log(err))
}
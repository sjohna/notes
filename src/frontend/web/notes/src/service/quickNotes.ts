import {BehaviorSubject, shareReplay} from "rxjs";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";

export interface Document {
    content: string;
    createdAt: string;
    id: number;
    type: string;
}

export interface DocumentsForDate {
    date: string;
    notes: Document[];
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

export function createNote(content: string) {
    if (!content) {
        return;
    }

    fetch('http://localhost:3000/quicknote', {
        'method': 'POST',
        'body': JSON.stringify({content})
    })
        .then(() => {
            fetchQuickNotes();
            const today = LocalDate.now();
            const fourDaysAgo = today.minusDays(4);
            fetchQuickNotesInDateRange(fourDaysAgo, today);
        } )
        .catch(err => console.log(err))
}

const quickNotesInDateRange$$ = new BehaviorSubject<DocumentsForDate[]>([]);
export const quickNotesInDateRange$ = quickNotesInDateRange$$.pipe(shareReplay(1));

export function fetchQuickNotesInDateRange(startDate: LocalDate, endDate: LocalDate) {
    const url = new URL('http://localhost:3000/quicknote/daterange');
    url.searchParams.append('begin', startDate.format(DateTimeFormatter.ISO_LOCAL_DATE))
    url.searchParams.append('end', endDate.format(DateTimeFormatter.ISO_LOCAL_DATE))

    fetch(url, {
        'method': 'GET'
    })
        .then(async response => quickNotesInDateRange$$.next(await response.json() as DocumentsForDate[]))
        .catch(err => console.log(err))
}
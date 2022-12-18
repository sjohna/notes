import {BehaviorSubject, shareReplay} from "rxjs";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";
import {environment} from "../environment/environment";

export interface Document {
    content: string;
    createdAt: string;
    createdAtPrecision: string;
    documentTime: string;
    documentTimePrecision: string;
    insertedAt: string;
    id: number;
    type: string;
}

export interface DocumentsForDate {
    date: string;
    notes: Document[];
}

export interface DocumentQueryParameters {
    startTime?: string;
    endTime?: string;
    sortBy?: string;
    sortDirection?: string;
}

export interface QuickNoteResponse {
    documents: Document[];
    parameters: DocumentQueryParameters;
}

const quickNotes$$ = new BehaviorSubject<QuickNoteResponse>(null);
export const quickNotes$ = quickNotes$$.pipe(shareReplay(1));

export function fetchQuickNotes(sortDirection?: string) {
    const body: DocumentQueryParameters = {
        sortBy: 'document_time',
        sortDirection,
    }

    fetch(`${environment.apiUrl}/quicknote`, {
        'method': 'POST',
        'body': JSON.stringify(body),
    })
        .then(async response => quickNotes$$.next(await response.json() as QuickNoteResponse))
        .catch(err => console.log(err))
}

export function createNote(content: string) {
    if (!content) {
        return;
    }

    fetch(`${environment.apiUrl}/quicknote/create`, {
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
    const url = new URL(`${environment.apiUrl}/quicknote/daterange`);
    url.searchParams.append('begin', startDate.format(DateTimeFormatter.ISO_LOCAL_DATE))
    url.searchParams.append('end', endDate.format(DateTimeFormatter.ISO_LOCAL_DATE))

    fetch(url, {
        'method': 'GET'
    })
        .then(async response => quickNotesInDateRange$$.next(await response.json() as DocumentsForDate[]))
        .catch(err => console.log(err))
}
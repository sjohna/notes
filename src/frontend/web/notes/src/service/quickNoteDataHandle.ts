import {Document} from "./quickNotes";
import {BehaviorSubject, Observable, shareReplay, Subject, takeUntil} from "rxjs";
import {LocalDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";

export interface QuickNoteQueryParameters {
    startTime?: LocalDateTime;
    endTime?: LocalDateTime;
    sortBy?: string;
    sortDirection?: string;
}

interface GetQuickNotesResponse {
    documents: Document[];
    parameters: QuickNoteQueryParameters;   // TODO: types for this are not right
}

export class QuickNoteDataHandle {
    private close$$ = new Subject<boolean>();

    private notes$$ = new BehaviorSubject<Document[]>([]);
    public notes$: Observable<Document[]> = this.notes$$.pipe(takeUntil(this.close$$), shareReplay(1));

    public parameters: QuickNoteQueryParameters = {};

    public get() {
        fetch(`${environment.apiUrl}/quicknote`, {
            'method': 'POST',
            'body': JSON.stringify(this.parameters)
        })
            .then(async (response) => {
                this.notes$$.next((await response.json() as GetQuickNotesResponse).documents);
            } )
            .catch(err => console.log(err)) // TODO: error handling
    }

    public close() {
        this.close$$.next(true);
    }
}
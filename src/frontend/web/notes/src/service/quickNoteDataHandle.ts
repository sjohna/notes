import {Document} from "./quickNotes";
import {BehaviorSubject, Observable, shareReplay, Subject, takeUntil} from "rxjs";
import {DateTimeFormatter, LocalDateTime, ZonedDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";

export interface QuickNoteQueryParameters {
    startTime?: ZonedDateTime;
    endTime?: ZonedDateTime;
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
            'body': JSON.stringify({
                startTime: this.parameters.startTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                endTime: this.parameters.endTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                sortBy: this.parameters.sortBy,
                sortDirection: this.parameters.sortDirection,
            })
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
import {Document} from "./quickNotes";
import {BehaviorSubject, Observable, shareReplay, Subject, takeUntil} from "rxjs";
import {DateTimeFormatter, ZonedDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";

export class QuickNoteQueryParameters {
    startTime?: ZonedDateTime;
    endTime?: ZonedDateTime;
    sortBy?: string;
    sortDirection?: string;

    constructor() {}

    toBodyString() {
        return JSON.stringify({
            startTime: this.startTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            endTime: this.endTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
        });
    };
}

interface GetQuickNotesResponse {
    documents: Document[];
    parameters: QuickNoteQueryParameters;   // TODO: types for this are not right
}

export class QuickNoteDataHandle {
    private close$$ = new Subject<boolean>();

    private notes$$ = new BehaviorSubject<Document[]>([]);
    public notes$: Observable<Document[]> = this.notes$$.pipe(takeUntil(this.close$$), shareReplay(1));

    public parameters = new QuickNoteQueryParameters();

    public get() {
        fetch(`${environment.apiUrl}/quicknote`, {
            'method': 'POST',
            'body': this.parameters.toBodyString()
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
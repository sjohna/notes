import {Document, documentFilters} from "./quickNotes";
import {BehaviorSubject, lastValueFrom, Observable, shareReplay, Subject, take, takeUntil} from "rxjs";
import {DateTimeFormatter, ZonedDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";

export interface TagQueryParameter {
    tag: number;
    exclude: boolean;
}

export class QuickNoteQueryParameters {
    startTime?: ZonedDateTime;
    endTime?: ZonedDateTime;
    sortBy?: string;
    sortDirection?: string;
    tags?: TagQueryParameter[];

    constructor() {
        this.tags = [];
    }

    toBodyString() {
        return JSON.stringify({
            startTime: this.startTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            endTime: this.endTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
            tags: this.tags,
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

    public parameters$ = documentFilters.filter$;

    constructor() {
        this.parameters$.subscribe(() => this.get());
    }

    public async get() {
        const parameters = await lastValueFrom(this.parameters$.pipe(take(1)));

        fetch(`${environment.apiUrl}/quicknote`, {
            'method': 'POST',
            'body': parameters.toBodyString()
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
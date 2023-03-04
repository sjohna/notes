import {BehaviorSubject, lastValueFrom, Observable, shareReplay, Subject, Subscription, take, takeUntil} from "rxjs";
import {DateTimeFormatter, ZonedDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";
import {DocumentFilterService} from "./documentFilterService";
import {Tag} from "./tagService";

export interface Document {
    content: string;
    createdAt: string;
    createdAtPrecision: string;
    documentTime: string;
    documentTimePrecision: string;
    insertedAt: string;
    id: number;
    type: string;
    tags?: Tag[];
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

export class QuickNoteService {
    private close$$ = new Subject<boolean>();

    private notes$$ = new BehaviorSubject<Document[]>([]);
    public notes$: Observable<Document[]> = this.notes$$.pipe(takeUntil(this.close$$), shareReplay(1));

    private parameters$: Observable<QuickNoteQueryParameters>;

    private sub: Subscription;

    public documentUpdated$$ = new Subject<Document>();

    constructor(
        private filterService: DocumentFilterService
    ) {
        this.parameters$ = this.filterService.filter$;
        this.sub = this.parameters$.subscribe(() => this.get());
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

    public createNote(content: string) {
        if (!content) {
            return;
        }

        fetch(`${environment.apiUrl}/quicknote/create`, {
            'method': 'POST',
            'body': JSON.stringify({content})
        })
            .then(() => {
                this.get();
            } )
            .catch(err => console.log(err))
    }

    public close() {
        this.close$$.next(true);
        this.sub.unsubscribe();
    }

    public documentUpdated(document: Document) {
        this.documentUpdated$$.next(document);
    }
}
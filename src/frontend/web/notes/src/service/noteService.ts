import {BehaviorSubject, lastValueFrom, Observable, shareReplay, Subject, Subscription, take, takeUntil} from "rxjs";
import {DateTimeFormatter, ZonedDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";
import {DocumentFilterService} from "./documentFilterService";
import {Tag} from "./tagService";
import {Group} from "./groupService";
import {AuthService} from "./authService";

export interface Document {
    latestVersion: NoteContent;
    createdAt: string;
    createdAtPrecision: string;
    documentTime: string;
    documentTimePrecision: string;
    insertedAt: string;
    id: number;
    type: string;
    tags?: Tag[];               // TODO: minimal types for these...
    groups?: Group[];
}

export interface DocumentQueryParameters {
    startTime?: string;
    endTime?: string;
    sortBy?: string;
    sortDirection?: string;
}

export interface TagQueryParameter {
    tag: number;
    exclude: boolean;
}

export class NoteQueryParameters {
    startTime?: ZonedDateTime;
    endTime?: ZonedDateTime;
    sortBy?: string;
    sortDirection?: string;
    tags?: TagQueryParameter[];

    constructor() {
        this.tags = [];
    }

    toBody() {
        return {
            startTime: this.startTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            endTime: this.endTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
            tags: this.tags,
        };
    };
}

interface GetNotesResponse {
    documents: Document[];
    parameters: NoteQueryParameters;   // TODO: types for this are not right
}

interface DocumentVersionSummary {
    id: number;
    version: number;
    contentLength: number;
    contentType: string;
    createdAt: string;
}

interface NoteDetails {
    document: Document;
    versionHistory: DocumentVersionSummary[];
}

interface NoteContent {
    id: number;
    documentId: number;
    type: string;
    content: string;
    version: number;
    createdAt: string;
}

export class NoteService {
    private close$$ = new Subject<boolean>();

    private notes$$ = new BehaviorSubject<Document[]>([]);
    public notes$: Observable<Document[]> = this.notes$$.pipe(takeUntil(this.close$$), shareReplay(1));

    private currentNote$$ = new BehaviorSubject<NoteDetails>(null);
    public currentNote$: Observable<NoteDetails> = this.currentNote$$.pipe(takeUntil(this.close$$), shareReplay(1));

    private currentNoteVersion$$ = new BehaviorSubject<NoteContent>(null);
    public currentNoteVersion$: Observable<NoteContent> = this.currentNoteVersion$$.pipe(takeUntil(this.close$$), shareReplay(1));

    private parameters$: Observable<NoteQueryParameters>;

    private sub: Subscription;

    public documentUpdated$$ = new Subject<Document>();

    constructor(
        private filterService: DocumentFilterService,
        private authService: AuthService,
    ) {
        this.parameters$ = this.filterService.filter$;
        this.sub = this.authService.changesWhileLoggedIn(this.parameters$).subscribe(() => this.get());
    }

    public async get() {
        const parameters = await lastValueFrom(this.parameters$.pipe(take(1)));

        this.authService.post(`${environment.apiUrl}/note`, parameters.toBody())
            .then(async (response) => {
                this.notes$$.next((await response.json() as GetNotesResponse).documents);
            } )
            .catch(err => console.log(err)) // TODO: error handling
    }

    public async getNote(id: number) {
        this.currentNote$$.next(null);

        this.authService.get(`${environment.apiUrl}/note/${id}`)
            .then(async (response) => {
                this.currentNote$$.next((await response.json() as NoteDetails))
            })
            .catch(err => console.log(err))
    }

    public async getNoteVersion(noteID: number, version: number) {
        this.currentNoteVersion$$.next(null);

        this.authService.get(`${environment.apiUrl}/note/${noteID}/version/${version}`)
            .then(async (response) => {
                this.currentNoteVersion$$.next((await response.json() as NoteContent))
            })
            .catch(err => console.log(err))
    }

    public createNote(content: string) {
        if (!content) {
            return;
        }

        this.authService.post(`${environment.apiUrl}/note/create`, {content})
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
import {BehaviorSubject, lastValueFrom, Observable, shareReplay, Subject, Subscription, take, takeUntil} from "rxjs";
import {DateTimeFormatter, ZonedDateTime} from "@js-joda/core";
import {environment} from "../environment/environment";
import {DocumentFilterService} from "./documentFilterService";
import {Tag} from "./tagService";
import {Group} from "./groupService";
import {AuthService} from "./authService";
import {APIData, Default, FromData, FromError, FromErrorOrData, InProgress} from "./apiData";

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

    private notes$$ = new BehaviorSubject<APIData<Document[]>>(Default());
    public notes$: Observable<APIData<Document[]>> = this.notes$$.pipe(takeUntil(this.close$$), shareReplay(1));

    private currentNote$$ = new BehaviorSubject<APIData<NoteDetails>>(null);
    public currentNote$: Observable<APIData<NoteDetails>> = this.currentNote$$.pipe(takeUntil(this.close$$), shareReplay(1));

    private currentNoteVersion$$ = new BehaviorSubject<APIData<NoteContent>>(null);
    public currentNoteVersion$: Observable<APIData<NoteContent>> = this.currentNoteVersion$$.pipe(takeUntil(this.close$$), shareReplay(1));

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

        this.notes$$.next(InProgress())
        const response = await this.authService.postResp<GetNotesResponse>(`${environment.apiUrl}/note`, parameters.toBody());
        this.notes$$.next(FromErrorOrData(response.error, response.response.documents))
    }

    public async getNote(id: number) {
        this.currentNote$$.next(InProgress());
        const response = await this.authService.getResp<NoteDetails>(`${environment.apiUrl}/note/${id}`);
        this.currentNote$$.next(FromErrorOrData(response.error, response.response))
    }

    public async getNoteVersion(noteID: number, version: number) {
        this.currentNoteVersion$$.next(InProgress());
        const response = await this.authService.getResp<NoteContent>(`${environment.apiUrl}/note/${noteID}/${version}`);
        this.currentNoteVersion$$.next(FromErrorOrData(response.error, response.response))
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
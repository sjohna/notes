import {BehaviorSubject, shareReplay} from "rxjs";
import {environment} from "../environment/environment";
import {NoteService} from "./noteService";
import {Document} from "./noteService";
import {AuthService} from "./authService";
import {APIData, Default, FromErrorOrData, InProgress} from "./apiData";

export const DOCUMENT_METADATA_UPDATE_ADD = 1;
export const DOCUMENT_METADATA_UPDATE_REMOVE = 2;

export interface Tag {
    id: number;
    name: string;
    description?: string;
    insertedAt?: string;
    archivedAt?: string;
    documentCount: number;
}

export class TagService {
    private tags$$ = new BehaviorSubject<APIData<Tag[]>>(Default());
    public tags$ = this.tags$$.pipe(shareReplay(1));

    constructor(
        private notes: NoteService,
        private authService: AuthService,
    ) {}

    public async get() {
        this.tags$$.next(InProgress())
        const response = await this.authService.postResp<Tag[]>(`${environment.apiUrl}/tag`)
        this.tags$$.next(FromErrorOrData(response.error, response.response))
    }

    public createTag(name: string, description?: string) {
        if (!name) {
            return;
        }

        this.authService.post(`${environment.apiUrl}/tag/create`, {name, description})
            .then(() => {
                this.get();
            } )
            .catch(err => console.log(err))
    }

    public addTagToDocument(tagId: number, documentId: number) {
        const body = {
            documentId,
            tagUpdates: [
                {
                    tagId,
                    updateType: DOCUMENT_METADATA_UPDATE_ADD,
                }
            ]
        }

        this.authService.post(`${environment.apiUrl}/note/update_tags`, body)
            .then(async (response) => {
                this.notes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }

    public removeTagFromDocument(tagId: number, documentId: number) {
        const body = {
            documentId,
            tagUpdates: [
                {
                    tagId,
                    updateType: DOCUMENT_METADATA_UPDATE_REMOVE,
                }
            ]
        }

        this.authService.post(`${environment.apiUrl}/note/update_tags`, body)
            .then(async (response) => {
                this.notes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }
}
import {BehaviorSubject, shareReplay} from "rxjs";
import {environment} from "../environment/environment";
import {NoteService} from "./noteService";
import {Document} from "./noteService";
import {token} from "./authService";
import {authedPost} from "../utility/fetch";

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
    private tags$$ = new BehaviorSubject<Tag[]>([]);
    public tags$ = this.tags$$.pipe(shareReplay(1));

    constructor(
        private notes: NoteService,
    ) {}

    public get() {
        authedPost(`${environment.apiUrl}/tag`)
            .then(async response => this.tags$$.next(await response.json() as Tag[]))
            .catch(err => console.log(err))
    }

    public createTag(name: string, description?: string) {
        if (!name) {
            return;
        }

        authedPost(`${environment.apiUrl}/tag/create`, {name, description})
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

        authedPost(`${environment.apiUrl}/note/update_tags`, body)
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

        authedPost(`${environment.apiUrl}/note/update_tags`, body)
            .then(async (response) => {
                this.notes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }
}
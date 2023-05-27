import {BehaviorSubject, shareReplay} from "rxjs";
import {Document, NoteService} from "./noteService";
import {environment} from "../environment/environment";
import {DOCUMENT_METADATA_UPDATE_ADD, DOCUMENT_METADATA_UPDATE_REMOVE} from "./tagService";
import {token} from "./authService";
import {authedPost} from "../utility/fetch";


export interface Group {
    id: number;
    name: string;
    description?: string;
    insertedAt?: string;
    archivedAt?: string;
    documentCount: number;
}

export class GroupService {
    private groups$$ = new BehaviorSubject<Group[]>([]);
    public groups$ = this.groups$$.pipe(shareReplay(1));

    constructor(
        private notes: NoteService,
    ) {}

    public get() {
        fetch(`${environment.apiUrl}/group`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
            .then(async response => this.groups$$.next(await response.json() as Group[]))
            .catch(err => console.log(err))
    }

    public createGroup(name: string, description?: string) {
        if (!name) {
            return;
        }

        authedPost(`${environment.apiUrl}/group/create`, {name, description})
            .then(() => {
                this.get();
            } )
            .catch(err => console.log(err))
    }

    public addDocumentToGroup(groupId: number, documentId: number) {
        const body = {
            documentId,
            groupUpdates: [
                {
                    groupId: groupId,
                    updateType: DOCUMENT_METADATA_UPDATE_ADD,
                }
            ]
        }

        authedPost(`${environment.apiUrl}/note/update_groups`, body)
            .then(async (response) => {
                this.notes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }

    public removeDocumentFromGroup(groupId: number, documentId: number) {
        const body = {
            documentId,
            groupUpdates: [
                {
                    groupId: groupId,
                    updateType: DOCUMENT_METADATA_UPDATE_REMOVE,
                }
            ]
        }

        authedPost(`${environment.apiUrl}/note/update_groups`, body)
            .then(async (response) => {
                this.notes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }
}
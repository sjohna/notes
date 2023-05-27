import {BehaviorSubject, shareReplay} from "rxjs";
import {Document, NoteService} from "./noteService";
import {environment} from "../environment/environment";
import {DOCUMENT_METADATA_UPDATE_ADD, DOCUMENT_METADATA_UPDATE_REMOVE} from "./tagService";
import {AuthService} from "./authService";

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
        private authService: AuthService,
    ) {}

    public get() {
        this.authService.post(`${environment.apiUrl}/group`)
            .then(async response => this.groups$$.next(await response.json() as Group[]))
            .catch(err => console.log(err))
    }

    public createGroup(name: string, description?: string) {
        if (!name) {
            return;
        }

        this.authService.post(`${environment.apiUrl}/group/create`, {name, description})
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

        this.authService.post(`${environment.apiUrl}/note/update_groups`, body)
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

        this.authService.post(`${environment.apiUrl}/note/update_groups`, body)
            .then(async (response) => {
                this.notes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }
}
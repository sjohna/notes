import {BehaviorSubject, shareReplay} from "rxjs";
import {Document, QuickNoteService} from "./quickNoteService";
import {environment} from "../environment/environment";
import {DOCUMENT_METADATA_UPDATE_ADD, DOCUMENT_METADATA_UPDATE_REMOVE} from "./tagService";


export interface DocumentGroup {
    id: number;
    name: string;
    description?: string;
    insertedAt?: string;
    archivedAt?: string;
    documentCount: number;
}

export class DocumentGroupService {
    private documentGroups$$ = new BehaviorSubject<DocumentGroup[]>([]);
    public documentGroups$ = this.documentGroups$$.pipe(shareReplay(1));

    constructor(
        private quickNotes: QuickNoteService,
    ) {}

    public get() {
        fetch(`${environment.apiUrl}/document_group`, {
            'method': 'POST'
        })
            .then(async response => this.documentGroups$$.next(await response.json() as DocumentGroup[]))
            .catch(err => console.log(err))
    }

    public createDocumentGroup(name: string, description?: string) {
        if (!name) {
            return;
        }

        fetch(`${environment.apiUrl}/document_group/create`, {
            'method': 'POST',
            'body': JSON.stringify({name, description})
        })
            .then(() => {
                this.get();
            } )
            .catch(err => console.log(err))
    }

    public addGroupToDocument(groupId: number, documentId: number) {
        const body = {
            documentId,
            groupUpdates: [
                {
                    groupId: groupId,
                    updateType: DOCUMENT_METADATA_UPDATE_ADD,
                }
            ]
        }

        fetch(`${environment.apiUrl}/quicknote/update_groups`, {
            'method': 'POST',
            'body': JSON.stringify(body)
        })
            .then(async (response) => {
                this.quickNotes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }

    public removeGroupFromDocument(groupId: number, documentId: number) {
        const body = {
            documentId,
            groupUpdates: [
                {
                    groupId: groupId,
                    updateType: DOCUMENT_METADATA_UPDATE_REMOVE,
                }
            ]
        }

        fetch(`${environment.apiUrl}/quicknote/update_groups`, {
            'method': 'POST',
            'body': JSON.stringify(body)
        })
            .then(async (response) => {
                this.quickNotes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }
}
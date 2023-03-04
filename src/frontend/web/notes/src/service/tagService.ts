import {BehaviorSubject, shareReplay} from "rxjs";
import {environment} from "../environment/environment";
import {QuickNoteService} from "./quickNoteService";
import {Document} from "./quickNoteService";

const TAG_UPDATE_ADD = 1;
const TAG_UPDATE_REMOVE = 2;

export interface Tag {
    id: number;
    name: string;
    description?: string;
}

export class TagService {
    private tags$$ = new BehaviorSubject<Tag[]>([])
    public tags$ = this.tags$$.pipe(shareReplay(1));

    constructor(
        private quickNotes: QuickNoteService,
    ) {}

    public get() {
        fetch('http://localhost:3000/tag', {
            'method': 'GET'
        })
            .then(async response => this.tags$$.next(await response.json() as Tag[]))
            .catch(err => console.log(err))
    }

    public createTag(name: string, description?: string) {
        if (!name) {
            return;
        }

        fetch(`${environment.apiUrl}/tag`, {
            'method': 'POST',
            'body': JSON.stringify({name, description})
        })
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
                    updateType: TAG_UPDATE_ADD,
                }
            ]
        }

        fetch(`${environment.apiUrl}/quicknote/update_tags`, {
            'method': 'POST',
            'body': JSON.stringify(body)
        })
            .then(async (response) => {
                this.quickNotes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }

    public removeTagFromDocument(tagId: number, documentId: number) {
        const body = {
            documentId,
            tagUpdates: [
                {
                    tagId,
                    updateType: TAG_UPDATE_REMOVE,
                }
            ]
        }

        fetch(`${environment.apiUrl}/quicknote/update_tags`, {
            'method': 'POST',
            'body': JSON.stringify(body)
        })
            .then(async (response) => {
                this.quickNotes.documentUpdated(await response.json() as Document)
            })
            .catch(err => console.log(err))
    }
}
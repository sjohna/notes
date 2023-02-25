import {environment} from "../environment/environment";
import {QuickNoteDataHandle} from "./quickNoteDataHandle";
import {Tag} from "./tags";
import {Subject} from "rxjs";
import {DocumentFilterHandle} from "./documentFilterHandle";

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

export const documentFilters = new DocumentFilterHandle();
documentFilters.filter.sortBy = 'document_time';
documentFilters.filter.sortDirection = 'descending';

export const quickNoteDataHandle = new QuickNoteDataHandle();

export function createNote(content: string) {
    if (!content) {
        return;
    }

    fetch(`${environment.apiUrl}/quicknote/create`, {
        'method': 'POST',
        'body': JSON.stringify({content})
    })
        .then(() => {
            quickNoteDataHandle.get();
        } )
        .catch(err => console.log(err))
}

export const documentUpdated$$ = new Subject<Document>();
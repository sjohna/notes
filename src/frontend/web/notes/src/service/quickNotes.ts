import {BehaviorSubject, shareReplay} from "rxjs";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";
import {environment} from "../environment/environment";
import {QuickNoteDataHandle} from "./quickNoteDataHandle";
import {Tag} from "./tags";

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

export interface DocumentsForDate {
    date: string;
    notes: Document[];
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

export const quickNoteDataHandle = new QuickNoteDataHandle();
quickNoteDataHandle.parameters.sortBy = 'document_time';
quickNoteDataHandle.parameters.sortDirection = 'descending';

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
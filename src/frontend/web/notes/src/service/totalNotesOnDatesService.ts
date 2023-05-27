import {BehaviorSubject, Observable, shareReplay, Subject, takeUntil} from "rxjs";
import {LocalDate} from "@js-joda/core";
import {environment} from "../environment/environment";
import {authedPost} from "../utility/fetch";

export interface DocumentsOnDate {
    date: string;
    count: number;
}

export interface TotalNotesOnDaysQueryParameters {
    startDate?: LocalDate;
    endDate?: LocalDate;
}

export class TotalNotesOnDatesService {
    private close$$ = new Subject<boolean>();

    private notesOnDates$$ = new BehaviorSubject<DocumentsOnDate[] | null>(null);
    public notesOnDates$: Observable<DocumentsOnDate[] | null> = this.notesOnDates$$.pipe(takeUntil(this.close$$), shareReplay(1));

    public parameters: TotalNotesOnDaysQueryParameters = {};

    public get() {
        authedPost(`${environment.apiUrl}/quicknote/total_by_date`, this.parameters)
            .then(async (response) => {
                this.notesOnDates$$.next(await response.json() as DocumentsOnDate[]);
            } )
            .catch(err => console.log(err)) // TODO: error handling
    }

    public close() {
        this.close$$.next(true);
    }
}
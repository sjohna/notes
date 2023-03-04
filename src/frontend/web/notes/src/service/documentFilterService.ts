import {QuickNoteQueryParameters} from "./quickNoteService";
import {BehaviorSubject, shareReplay} from "rxjs";

export class DocumentFilterService {
    public filter = new QuickNoteQueryParameters();

    private filter$$ = new BehaviorSubject<QuickNoteQueryParameters>(this.filter);
    public filter$ = this.filter$$.pipe(shareReplay(1));

    constructor() {

    }

    public update() {
        this.filter$$.next(this.filter);
    }
}
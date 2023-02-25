import {QuickNoteQueryParameters} from "./quickNoteDataHandle";
import {BehaviorSubject, shareReplay} from "rxjs";

export class DocumentFilterHandle {
    public filter = new QuickNoteQueryParameters();

    private filter$$ = new BehaviorSubject<QuickNoteQueryParameters>(this.filter);
    public filter$ = this.filter$$.pipe(shareReplay(1));

    constructor() {

    }

    public update() {
        this.filter$$.next(this.filter);
    }
}
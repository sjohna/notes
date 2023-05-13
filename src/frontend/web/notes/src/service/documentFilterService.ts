import {NoteQueryParameters} from "./noteService";
import {BehaviorSubject, shareReplay} from "rxjs";

export class DocumentFilterService {
    public filter = new NoteQueryParameters();

    private filter$$ = new BehaviorSubject<NoteQueryParameters>(this.filter);
    public filter$ = this.filter$$.pipe(shareReplay(1));

    constructor() {

    }

    public update() {
        this.filter$$.next(this.filter);
    }
}
import {BehaviorSubject, shareReplay} from "rxjs";
import {AuthService} from "./authService";
import {environment} from "../environment/environment";
import {Group} from "./groupService";

export interface GeneralInfo {
    name: string;
    documentCount: number;
    lastCreatedDocumentId?: number;
    lastCreatedDocumentTime?: string;
}

export class GeneralService {
    private generalInfo$$ = new BehaviorSubject<GeneralInfo>(null);
    public generalInfo$ = this.generalInfo$$.pipe(shareReplay(1));  // TODO: really understand what shareReplay does

    constructor(private authService: AuthService) {}

    public get() {
        this.authService.get(`${environment.apiUrl}/general/info`)
            .then(async response => {
                this.generalInfo$$.next(await response.json() as GeneralInfo)
            })
            .catch(err => console.log(err))
    }
}
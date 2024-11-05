import {NoteQueryParameters} from "../../../service/noteService";
import {Observable, Subscription} from "rxjs";
import {Services} from "../../../service/services";
import {CompositeComponentBase, Div, div} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";

export class NoteFilterView extends CompositeComponentBase {
    private parameters$: Observable<NoteQueryParameters>;

    constructor(
        private s: Services,
    ) {
        super(div());

        this.parameters$ = this.s.documentFilterService.filter$;

        this.onTeardown(unsubscribe(this.parameters$.subscribe((filters) => {
            this.root.clear();

            if (filters.endTime || filters.startTime) {
                if (!filters.endTime) {
                    div(`After ${filters.startTime}`)
                        .in(this.root);
                } else if (!filters.startTime) {
                    div(`Before ${filters.endTime}`)
                        .in(this.root);
                } else {
                    div(`${filters.startTime} - ${filters.endTime}`)
                        .in(this.root);
                }
            }

            if (filters.tags) {
                for (const tag of filters.tags) {
                    const includeExclude = tag.exclude ? "EXCLUDE" : "INCLUDE";

                    div(`${includeExclude}: ${tag.tag}`)
                        .in(this.root);
                }
            }
        })))
    }
}
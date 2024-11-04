import {NoteQueryParameters} from "../../../service/noteService";
import {Observable, Subscription} from "rxjs";
import {Services} from "../../../service/services";
import {ComponentBase, Div, div} from "../../../utility/component";

export class NoteFilterView extends ComponentBase {
    private parameters$: Observable<NoteQueryParameters>;

    private sub: Subscription;

    private container: Div = div();

    constructor(
        private s: Services,
    ) {
        super();

        this.parameters$ = this.s.documentFilterService.filter$;

        this.sub?.unsubscribe();

        this.sub = this.parameters$.subscribe((filters) => {
            this.container.clear();

            if (filters.endTime || filters.startTime) {
                if (!filters.endTime) {
                    div(`After ${filters.startTime}`)
                        .in(this.container);
                } else if (!filters.startTime) {
                    div(`Before ${filters.endTime}`)
                        .in(this.container);
                } else {
                    div(`${filters.startTime} - ${filters.endTime}`)
                        .in(this.container);
                }
            }

            if (filters.tags) {
                for (const tag of filters.tags) {
                    const includeExclude = tag.exclude ? "EXCLUDE" : "INCLUDE";

                    div(`${includeExclude}: ${tag.tag}`)
                        .in(this.container);
                }
            }
        })
    }

    public root(): HTMLElement {
        return this.container.root()
    }

    public teardown(): void {
        super.teardown();

        this.sub?.unsubscribe();
    }

}
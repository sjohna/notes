import {View} from "../../utility/view";
import {AnyBuilder, clear, div} from "../../utility/element";
import {DocumentFilterHandle} from "../../service/documentFilterHandle";
import {QuickNoteQueryParameters} from "../../service/quickNoteDataHandle";
import {Observable, Subscription} from "rxjs";
import {documentFilters} from "../../service/quickNotes";


export class QuickNotesFilterView implements View {
    private parameters$: Observable<QuickNoteQueryParameters>;

    private sub: Subscription;

    constructor(private container: AnyBuilder) {
        this.parameters$ = documentFilters.filter$;
    }

    public setup(): void {
        this.sub?.unsubscribe();

        this.sub = this.parameters$.subscribe((filters) => {
            clear(this.container);

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

    public teardown(): void {
        this.sub?.unsubscribe();
    }

}
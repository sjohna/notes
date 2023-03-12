import {SubViewCollection, View} from "../../utility/view";
import {AnyBuilder, clear, DivBuilder, div, hr, span} from "../../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {QuickNoteCardView} from "./quickNoteCardView";
import {Subscription} from "rxjs";
import {LabeledCheckbox} from "../component/labeledCheckbox";
import {Document} from "../../service/quickNoteService";
import {Services} from "../../service/services";

export class QuickNoteColumnView implements View {
    private subViews = new SubViewCollection();

    quickNotesSubscription?: Subscription;

    private noteContainer?: DivBuilder;
    private reverseOrderCheckbox?: LabeledCheckbox;

    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) { }

    setup(): void {
        this.quickNotesSubscription?.unsubscribe();
        clear(this.container);

        this.reverseOrderCheckbox = new LabeledCheckbox('Reverse Order')
            .in(this.container)
            .onchange((ev: Event) => {
                this.s.documentFilterService.filter.sortDirection = this.reverseOrderCheckbox.checked ? 'ascending' : 'descending';
                this.s.documentFilterService.update();
            });

        this.noteContainer = div()
            .in(this.container);

        this.quickNotesSubscription = this.s.quickNoteService.notes$.subscribe(notes => this.renderNotes(notes));
        this.s.quickNoteService.get();
    }

    private renderNotes(notes?: Document[]) {
        clear(this.noteContainer);

        if (!notes) {
            return;
        }

        let lastDate: string | undefined;

        for (let note of notes) {
            const createdDateTime = ZonedDateTime.parse(note.documentTime).withZoneSameInstant(ZoneId.of('America/Denver'));
            const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
            if (createdDate !== lastDate) {
                this.noteContainer.withChild(this.dateHeader(createdDate));

                lastDate = createdDate;
            }

            this.subViews.setupAndAdd(
                new QuickNoteCardView(this.noteContainer, note, this.s)
            );
        }
    }

    teardown(): void {
        this.quickNotesSubscription?.unsubscribe();
    }

    private dateHeader(date: string): DivBuilder {
        return div()
            .width('380px')
            .display('inline-flex')
            .marginHorizontal('8px')
            .padding('4px')
            .withChildren([
                hr()
                    .flexGrow('1'),
                span(date)
                    .marginHorizontal('24px'),
                hr()
                    .flexGrow('1'),
            ]);
    }
}
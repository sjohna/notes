import {SubViewCollection, View} from "../utility/view";
import {Document, fetchQuickNotes, quickNotes$} from "../service/quickNotes"
import {AnyBuilder, clear, DivBuilder, InputBuilder, newCheckbox, div, hr, span, flexRow} from "../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {QuickNoteCardView} from "./quickNoteCardView";
import {Subscription} from "rxjs";

export class QuickNoteColumnView implements View {
    constructor(private container: AnyBuilder) {}

    private subViews = new SubViewCollection();

    quickNotesSubscription?: Subscription;

    private noteContainer?: DivBuilder;
    private reverseOrderCheckbox?: InputBuilder;

    setup(): void {
        clear(this.container)

        this.reverseOrderCheckbox = newCheckbox()
            .onchange((ev: Event) => {
                fetchQuickNotes(this.reverseOrderCheckbox.element().checked ? "ascending" : "descending");
            });

        flexRow()
            .withChild(this.reverseOrderCheckbox)
            .withChild(
                div('Reverse Order')
            )
            .in(this.container);

        this.noteContainer = div()
            .in(this.container);

        this.quickNotesSubscription?.unsubscribe();
        this.quickNotesSubscription = quickNotes$.subscribe(notes => this.renderNotes(notes?.documents));
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
                new QuickNoteCardView(this.noteContainer, note)
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
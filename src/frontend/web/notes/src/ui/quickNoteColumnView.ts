import {SubViewCollection, View} from "../utility/view";
import {Document, quickNoteDataHandle} from "../service/quickNotes"
import {AnyBuilder, clear, DivBuilder, InputBuilder, checkbox, div, hr, span, flexRow} from "../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {QuickNoteCardView} from "./quickNoteCardView";
import {Subscription} from "rxjs";
import {QuickNoteDataHandle} from "../service/quickNoteDataHandle";

export class QuickNoteColumnView implements View {
    private subViews = new SubViewCollection();

    quickNotesSubscription?: Subscription;

    private noteContainer?: DivBuilder;
    private reverseOrderCheckbox?: InputBuilder;

    private dataHandle: QuickNoteDataHandle;

    constructor(
        private container: AnyBuilder,
        private handle: QuickNoteDataHandle,
    ) {
        this.dataHandle = handle;
    }

    setup(): void {
        this.quickNotesSubscription?.unsubscribe();
        clear(this.container);

        this.reverseOrderCheckbox = checkbox()
            .onchange((ev: Event) => {
                this.dataHandle.parameters.sortDirection = this.reverseOrderCheckbox.element().checked ? 'ascending' : 'descending';
                this.dataHandle.get();
            });

        flexRow()
            .in(this.container)
            .withChildren([
                this.reverseOrderCheckbox,
                div('Reverse Order'),
            ]);

        this.noteContainer = div()
            .in(this.container);

        this.quickNotesSubscription = this.dataHandle.notes$.subscribe(notes => this.renderNotes(notes));
        this.dataHandle.get();
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
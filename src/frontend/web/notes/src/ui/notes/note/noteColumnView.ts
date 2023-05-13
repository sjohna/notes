import {SubViewCollection, View} from "../../../utility/view";
import {AnyBuilder, clear, DivBuilder, div, hr, span} from "../../../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {NoteCardView} from "./noteCardView";
import {Subscription} from "rxjs";
import {LabeledCheckbox} from "../../component/labeledCheckbox";
import {Document} from "../../../service/noteService";
import {Services} from "../../../service/services";

export class NoteColumnView implements View {
    private subViews = new SubViewCollection();

    notesSubscription?: Subscription;

    private noteContainer?: DivBuilder;
    private reverseOrderCheckbox?: LabeledCheckbox;

    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) { }

    setup(): void {
        this.notesSubscription?.unsubscribe();
        clear(this.container);

        this.reverseOrderCheckbox = new LabeledCheckbox('Reverse Order')
            .in(this.container)
            .onchange((ev: Event) => {
                this.s.documentFilterService.filter.sortDirection = this.reverseOrderCheckbox.checked ? 'ascending' : 'descending';
                this.s.documentFilterService.update();
            });

        this.noteContainer = div()
            .in(this.container);

        this.notesSubscription = this.s.noteService.notes$.subscribe(notes => this.renderNotes(notes));
        this.s.noteService.get();
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
                new NoteCardView(this.noteContainer, note, this.s)
            );
        }
    }

    teardown(): void {
        this.notesSubscription?.unsubscribe();
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
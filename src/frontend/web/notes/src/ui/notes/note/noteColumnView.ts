import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {NoteCardView} from "./noteCardView";
import {Subscription} from "rxjs";
import {LabeledCheckbox} from "../../component/labeledCheckbox";
import {Document} from "../../../service/noteService";
import {Services} from "../../../service/services";
import {ComponentBase, div, Div, hr, span} from "../../../utility/component";

export class NoteColumnView extends ComponentBase {
    private container: Div = div();

    notesSubscription?: Subscription;

    private noteContainer?: Div;
    private reverseOrderCheckbox?: LabeledCheckbox;

    constructor(
        private s: Services,
    ) {
        super();

        this.notesSubscription?.unsubscribe();
        this.container.clear();

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

    public root(): HTMLElement {
        return this.container.root();
    }

    private renderNotes(notes?: Document[]) {
        this.noteContainer.clear();

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

            new NoteCardView(note, this.s).in(this.noteContainer);
        }
    }

    teardown(): void {
        this.container.teardown();

        this.notesSubscription?.unsubscribe();
    }

    private dateHeader(date: string): Div {
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
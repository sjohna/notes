import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {NoteCardView} from "./noteCardView";
import {Document} from "../../../service/noteService";
import {Services} from "../../../service/services";
import {CompositeComponentBase, div, Div, hr, span, ValueComponent} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {labelledCheckBox} from "../../component/labeledCheckbox";

export class NoteColumnView extends CompositeComponentBase {
    private noteContainer?: Div;
    private reverseOrderCheckbox?: ValueComponent<boolean>;

    constructor(
        private s: Services,
    ) {
        super(div());

        this.reverseOrderCheckbox = labelledCheckBox('Reverse Order', false)
            .in(this.root)
            .onchange((ev: Event) => {
                this.s.documentFilterService.filter.sortDirection = this.reverseOrderCheckbox.value ? 'ascending' : 'descending';
                this.s.documentFilterService.update();
            });

        this.noteContainer = div()
            .in(this.root);

        this.onTeardown(unsubscribe(this.s.noteService.notes$.subscribe(notes => this.renderNotes(notes))));
        this.s.noteService.get();
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
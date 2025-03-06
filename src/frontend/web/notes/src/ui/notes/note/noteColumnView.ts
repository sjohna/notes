import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {NoteCardView} from "./noteCardView";
import {Document} from "../../../service/noteService";
import {CompositeComponentBase, div, Div, hr, span, ValueComponent} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {labelledCheckBox} from "../../component/labeledCheckbox";
import {services} from "../../../service/services";
import {APIData} from "../../../service/apiData";
import {loading} from "../../../utility/loading";

export class NoteColumnView extends CompositeComponentBase {
    private noteContainer?: Div;
    private reverseOrderCheckbox?: ValueComponent<boolean>;

    constructor() {
        super(div());

        this.reverseOrderCheckbox = labelledCheckBox('Reverse Order', false)
            .in(this.root)
            .onchange((ev: Event) => {
                services.documentFilterService.filter.sortDirection = this.reverseOrderCheckbox.value ? 'ascending' : 'descending';
                services.documentFilterService.update();
            });

        this.noteContainer = div()
            .overflowY('auto')  // TODO: figure out scrolling...
            .in(this.root);

        this.onTeardown(unsubscribe(services.noteService.notes$.subscribe(notes => this.renderNotes(notes))));
        void services.noteService.get();
    }

    private renderNotes(notes: APIData<Document[]>) {
        this.noteContainer.clear();

        if (notes.inProgress) {
            loading('Fetching Notes').in(this.noteContainer);

            return;
        }

        if (notes.error) {
            div(`Error loading notes: ${notes.error}`).in(this.noteContainer);

            return;
        }

        if (!notes.data) {
            return;
        }

        let lastDate: string | undefined;

        for (let note of notes.data) {
            const createdDateTime = ZonedDateTime.parse(note.documentTime).withZoneSameInstant(ZoneId.of('America/Denver'));
            const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
            if (createdDate !== lastDate) {
                this.noteContainer.withChild(this.dateHeader(createdDate));

                lastDate = createdDate;
            }

            new NoteCardView(note).in(this.noteContainer);
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
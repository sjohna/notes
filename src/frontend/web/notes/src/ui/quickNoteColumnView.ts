import {SubViewCollection, View} from "../utility/view";
import {Document, quickNotes$} from "../service/quickNotes"
import {clear, newDiv, newHr, newSpan} from "../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {QuickNoteCardView} from "./quickNoteCardView";
import {Subscription} from "rxjs";

export class QuickNoteColumnView implements View {
    constructor(private container: HTMLElement) {}

    private subViews = new SubViewCollection();

    quickNotesSubscription?: Subscription;

    setup(): void {
        this.quickNotesSubscription?.unsubscribe();
        this.quickNotesSubscription = quickNotes$.subscribe(notes => this.renderNotes(notes));
    }

    private renderNotes(notes: Document[]) {
        clear(this.container);
        let lastDate: string | undefined;

        for (let note of notes) {
            const createdDateTime = ZonedDateTime.parse(note.documentTime).withZoneSameInstant(ZoneId.of('America/Denver'));
            const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
            if (createdDate != lastDate) {
                this.container.appendChild(this.dateHeader(createdDate));

                lastDate = createdDate;
            }

            this.subViews.setupAndAdd(
                new QuickNoteCardView(this.container, note)
            );
        }
    }

    teardown(): void {
        this.quickNotesSubscription?.unsubscribe();
    }

    private dateHeader(date: string): HTMLDivElement {
        return newDiv()
            .width('380px')
            .display('inline-flex')
            .marginHorizontal('8px')
            .padding('4px')
            .withChild( // left line
                newHr()
                    .flexGrow('1')
                    .element()
            )
            .withChild( // date
                newSpan()
                    .marginHorizontal('24px')
                    .innerText(date)
                    .element()
            )
            .withChild( // right line
                newHr()
                    .flexGrow('1')
                    .element()
            )
            .element();
    }
}
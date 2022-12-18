import {SubViewCollection, View} from "../utility/view";
import {Document, fetchQuickNotes, quickNotes$} from "../service/quickNotes"
import {clear, newCheckbox, newDiv, newHr, newSpan} from "../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {QuickNoteCardView} from "./quickNoteCardView";
import {Subscription} from "rxjs";

export class QuickNoteColumnView implements View {
    constructor(private container: HTMLElement) {}

    private subViews = new SubViewCollection();

    quickNotesSubscription?: Subscription;

    private noteContainer?: HTMLDivElement;
    private reverseOrderCheckbox?: HTMLInputElement;

    setup(): void {
        clear(this.container)

        this.reverseOrderCheckbox = newCheckbox()
            .onchange((ev: Event) => {
                fetchQuickNotes(this.reverseOrderCheckbox.checked ? "ascending" : "descending");
            })
            .element();

        newDiv()
            .display('flex')
            .flexDirection('row')
            .withChild(this.reverseOrderCheckbox)
            .withChild(
                newDiv()
                    .innerText('Reverse Order')
                    .element()
            )
            .in(this.container);

        this.noteContainer = newDiv()
            .in(this.container)
            .element();

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
                this.noteContainer.appendChild(this.dateHeader(createdDate));

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
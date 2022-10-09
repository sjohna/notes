import {SubViewCollection, View} from "../utility/view";
import {DocumentsForDate, quickNotes$, quickNotesInDateRange$} from "../service/quickNotes";
import {clear, newDiv, newHr, newSpan} from "../utility/element";
import {Subscription} from "rxjs";
import {QuickNoteCardView} from "./quickNoteCardView";


export class QuickNoteDateColumnsView implements View {
    constructor(private container: HTMLDivElement) {}

    private subViews = new SubViewCollection();

    quickNotesByDateSubscription?: Subscription;

    setup(): void {
        this.quickNotesByDateSubscription?.unsubscribe();
        this.quickNotesByDateSubscription = quickNotesInDateRange$.subscribe(notes => this.renderNotes(notes));
    }

    private renderNotes(notes: DocumentsForDate[]) {
        clear(this.container);

        const flexContainer = newDiv()
            .display('flex')
            .flexDirection('row')
            .in(this.container)
            .element()

        for (let notesOnDate of notes) {
            console.log(notesOnDate);
            const columnContainer = newDiv().in(flexContainer).element();

            columnContainer.appendChild(this.dateHeader(notesOnDate.date));

            for (let note of notesOnDate.notes) {
                this.subViews.setupAndAdd(
                    new QuickNoteCardView(columnContainer, note)
                );
            }
        }
    }

    teardown(): void {
        this.quickNotesByDateSubscription.unsubscribe();
        this.subViews.teardown();
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
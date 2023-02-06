import {SubViewCollection, View} from "../utility/view";
import {DocumentsForDate, quickNotesInDateRange$} from "../service/quickNotes";
import {clear, DivBuilder, div, hr, span, flexRow} from "../utility/element";
import {Subscription} from "rxjs";
import {QuickNoteCardView} from "./quickNoteCardView";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";


export class QuickNoteDateColumnsView implements View {
    constructor(private container: DivBuilder) {}

    private subViews = new SubViewCollection();

    quickNotesByDateSubscription?: Subscription;

    setup(): void {
        this.quickNotesByDateSubscription?.unsubscribe();
        this.quickNotesByDateSubscription = quickNotesInDateRange$.subscribe(notes => this.renderNotes(notes));
    }

    private renderNotes(notes: DocumentsForDate[]) {
        clear(this.container);

        const flexContainer = flexRow()
            .in(this.container);

        for (let notesOnDate of notes) {
            const columnContainer = div().in(flexContainer);

            const noteDate = LocalDate.parse(notesOnDate.date);
            noteDate.dayOfWeek()
            columnContainer.withChild(this.dateHeader(notesOnDate.date + ' (' + noteDate.format(DateTimeFormatter.ofPattern('EEEE').withLocale(Locale.US)) + ')'));

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

    private dateHeader(date: string): DivBuilder {
        return div()
            .width('380px')
            .display('inline-flex')
            .marginHorizontal('8px')
            .padding('4px')
            .withChildren([
                hr().flexGrow('1'),
                span(date).marginHorizontal('24px'),
                hr().flexGrow('1')

            ]);
    }
}
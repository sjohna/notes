import {createNote, quickNoteDataHandle} from "../service/quickNotes";
import {
    AnyBuilder,
    clear,
    DivBuilder,
    InputBuilder,
    button,
    checkbox,
    div,
    textArea, flexRow
} from "../utility/element";
import {View} from "../utility/view";
import {QuickNoteColumnView} from "./quickNoteColumnView";
import {QuickNoteDateColumnsView} from "./quickNoteDateColumnsView";
import {QuickNoteCalendarView} from "./quickNoteCalendarView";

export class QuickNoteView implements View {
    noteContainer: DivBuilder;
    newNoteText: HTMLTextAreaElement;

    private noteView: View;

    private dateColumnViewCheckbox: InputBuilder;
    private calendarViewCheckbox: InputBuilder;

    constructor(private container: AnyBuilder) { }

    public setup(): void {
        clear(this.container);
        button('New Note')
            .onclick(() => {createNote(this.newNoteText.value); this.newNoteText.value = '';})
            .inDiv()
            .in(this.container);

        const newNoteTextBuilder = textArea()
            .keydown((event: KeyboardEvent) => {
                if (event.ctrlKey && event.code == "Enter") {
                    createNote(this.newNoteText.value);
                    this.newNoteText.value = '';
                }
            })
            .margin("8px")
            .width("380px");

        this.newNoteText = newNoteTextBuilder.element();

        newNoteTextBuilder
            .inDiv()
            .in(this.container);

        this.dateColumnViewCheckbox = checkbox()
            .onchange((ev: Event) => {
                this.calendarViewCheckbox.element().checked = false;
                this.renderNotes();
            });

        this.calendarViewCheckbox = checkbox()
            .onchange((ev: Event) => {
                this.dateColumnViewCheckbox.element().checked = false;
                this.renderNotes();
            });

        flexRow()
            .in(this.container)
            .withChildren([
                this.dateColumnViewCheckbox,
                div('Date Column View'),
            ]);

        flexRow()
            .in(this.container)
            .withChildren([
                this.calendarViewCheckbox,
                div('Calendar View'),
            ]);

        this.noteContainer = div()
            .in(this.container);

        this.renderNotes();
    }

    public teardown(): void {
        this.noteView?.teardown();
    }

    private renderNotes() {
        this.noteView?.teardown();
        if (this.dateColumnViewCheckbox.element().checked) {
            this.noteView = new QuickNoteDateColumnsView(this.noteContainer);
        } else if (this.calendarViewCheckbox.element().checked) {
            this.noteView = new QuickNoteCalendarView(this.noteContainer);
        } else {
            this.noteView = new QuickNoteColumnView(this.noteContainer, quickNoteDataHandle);
        }
        this.noteView.setup();
    }
}
import {createNote, quickNoteDataHandle} from "../../service/quickNotes";
import {
    AnyBuilder,
    clear,
    DivBuilder,
    InputBuilder,
    button,
    checkbox,
    div,
    textArea, flexRow
} from "../../utility/element";
import {View} from "../../utility/view";
import {QuickNoteColumnView} from "./quickNoteColumnView";
import {QuickNoteDateColumnsView} from "./quickNoteDateColumnsView";
import {QuickNoteCalendarView} from "./quickNoteCalendarView";
import {LabeledCheckbox} from "../component/labeledCheckbox";

export class QuickNoteView implements View {
    noteContainer: DivBuilder;
    newNoteText: HTMLTextAreaElement;

    private noteView: View;

    private dateColumnViewCheckbox: LabeledCheckbox;
    private calendarViewCheckbox: LabeledCheckbox;

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

        this.dateColumnViewCheckbox = new LabeledCheckbox('Date Column View')
            .in(this.container)
            .onchange((ev: Event) => {
                this.calendarViewCheckbox.checked = false;
                this.renderNotes();
            });

        this.calendarViewCheckbox = new LabeledCheckbox('Calendar View')
            .in(this.container)
            .onchange((ev: Event) => {
                this.dateColumnViewCheckbox.checked = false;
                this.renderNotes();
            });

        this.noteContainer = div()
            .in(this.container);

        this.renderNotes();
    }

    public teardown(): void {
        this.noteView?.teardown();
    }

    private renderNotes() {
        this.noteView?.teardown();
        if (this.dateColumnViewCheckbox.checked) {
            this.noteView = new QuickNoteDateColumnsView(this.noteContainer);
        } else if (this.calendarViewCheckbox.checked) {
            this.noteView = new QuickNoteCalendarView(this.noteContainer);
        } else {
            this.noteView = new QuickNoteColumnView(this.noteContainer, quickNoteDataHandle);
        }
        this.noteView.setup();
    }
}
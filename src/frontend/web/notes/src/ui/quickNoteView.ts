import {createNote} from "../service/quickNotes";
import {clear, newButton, newCheckbox, newDiv, newTextArea} from "../utility/element";
import {View} from "../utility/view";
import {QuickNoteColumnView} from "./quickNoteColumnView";
import {QuickNoteDateColumnsView} from "./quickNoteDateColumnsView";
import {QuickNoteCalendarView} from "./quickNoteCalendarView";

export class QuickNoteView implements View {
    noteContainer: HTMLDivElement;
    newNoteText: HTMLTextAreaElement;

    private noteView: View;

    private dateColumnViewCheckbox: HTMLInputElement;
    private calendarViewCheckbox: HTMLInputElement;

    constructor(private container: HTMLElement) { }

    public setup(): void {
        clear(this.container);
        newButton()
            .innerText('New Note')
            .onclick(() => {createNote(this.newNoteText.value); this.newNoteText.value = '';})
            .inDiv()
            .in(this.container);

        const newNoteTextBuilder = newTextArea()
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

        this.dateColumnViewCheckbox = newCheckbox()
            .onchange((ev: Event) => {
                this.calendarViewCheckbox.checked = false;
                this.renderNotes();
            })
            .element();

        this.calendarViewCheckbox = newCheckbox()
            .onchange((ev: Event) => {
                this.dateColumnViewCheckbox.checked = false;
                this.renderNotes();
            })
            .element();

        newDiv()
            .display('flex')
            .flexDirection('row')
            .withChild(this.dateColumnViewCheckbox)
            .withChild(
                newDiv()
                    .innerText('Date Column View')
                    .element()
            )
            .in(this.container);

        newDiv()
            .display('flex')
            .flexDirection('row')
            .withChild(this.calendarViewCheckbox)
            .withChild(
                newDiv()
                    .innerText('Calendar View')
                    .element()
            )
            .in(this.container);

        this.noteContainer = newDiv()
            .in(this.container)
            .element();

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
            this.noteView = new QuickNoteColumnView(this.noteContainer);
        }
        this.noteView.setup();
    }
}
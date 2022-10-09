import {createNote} from "../service/quickNotes";
import {newButton, newCheckbox, newDiv, newTextArea} from "../utility/element";
import {View} from "../utility/view";
import {QuickNoteColumnView} from "./quickNoteColumnView";
import {QuickNoteDateColumnsView} from "./quickNoteDateColumnsView";

export class QuickNoteView implements View {
    noteContainer: HTMLDivElement;
    newNoteText: HTMLTextAreaElement;

    private noteView: View;

    private dateColumnViewCheckbox: HTMLInputElement;

    constructor(private container: HTMLElement) { }

    public setup(): void {
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
                this.renderNotes()
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
        } else {
            this.noteView = new QuickNoteColumnView(this.noteContainer);
        }
        this.noteView.setup();
    }
}
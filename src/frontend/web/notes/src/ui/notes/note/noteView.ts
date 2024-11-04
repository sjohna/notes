import {NoteColumnView} from "./noteColumnView";
import {NoteFilterView} from "./noteFilterView";
import {Services} from "../../../service/services";
import {button, Component, ComponentBase, Div, div, flexColumn, textArea} from "../../../utility/component";

export class NoteView extends ComponentBase {
    noteContainer: Div;
    newNoteText: HTMLTextAreaElement;

    private filterContainer: Div;

    private container: Div = div();

    constructor(
        private s: Services,
    ) {
        super();

        this.container.clear();
        button('New Note')
            .onclick(() => {this.s.noteService.createNote(this.newNoteText.value); this.newNoteText.value = '';})
            .inDiv()
            .in(this.container);

        const newNoteTextBuilder = textArea()
            .keydown((event: KeyboardEvent) => {
                if (event.ctrlKey && event.code == "Enter") {
                    this.s.noteService.createNote(this.newNoteText.value);
                    this.newNoteText.value = '';
                }
            })
            .margin("8px")
            .width("380px");

        this.newNoteText = newNoteTextBuilder.root();

        newNoteTextBuilder
            .inDiv()
            .in(this.container);

        this.filterContainer = div()
            .in(this.container);

        new NoteFilterView(this.s).in(this.filterContainer);

        this.noteContainer = flexColumn()
            .in(this.container)
            .flexGrow('1')
            .overflowY('auto')
            .paddingRight('20px')
            .paddingBottom('8px');

        new NoteColumnView(this.s).in(this.noteContainer);
    }

    public root(): HTMLElement {
        return this.container.root();
    }

    public teardown(): void {
        super.teardown();

        this.noteContainer.teardown();
    }
}
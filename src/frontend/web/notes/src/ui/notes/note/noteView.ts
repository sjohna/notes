import {NoteColumnView} from "./noteColumnView";
import {NoteFilterView} from "./noteFilterView";
import {Services} from "../../../service/services";
import {
    button,
    CompositeComponentBase,
    Div,
    div,
    flexColumn,
    textArea
} from "../../../utility/component";

export class NoteView extends CompositeComponentBase {
    noteContainer: Div;
    newNoteText: HTMLTextAreaElement;

    private filterContainer: Div;

    constructor(
        private s: Services,
    ) {
        super(div());

        button('New Note')
            .onclick(() => {this.s.noteService.createNote(this.newNoteText.value); this.newNoteText.value = '';})
            .inDiv()
            .in(this.root);

        const newNoteTextBuilder = textArea()
            .keydown((event: KeyboardEvent) => {
                if (event.ctrlKey && event.code == "Enter") {
                    this.s.noteService.createNote(this.newNoteText.value);
                    this.newNoteText.value = '';
                }
            })
            .margin("8px")
            .width("380px");

        this.newNoteText = newNoteTextBuilder.rootElement;

        newNoteTextBuilder
            .inDiv()
            .in(this.root);

        this.filterContainer = div()
            .in(this.root);

        new NoteFilterView(this.s).in(this.filterContainer);

        this.noteContainer = flexColumn()
            .in(this.root)
            .flexGrow('1')
            .overflowY('auto')
            .paddingRight('20px')
            .paddingBottom('8px');

        new NoteColumnView(this.s).in(this.noteContainer);
    }

    public teardown(): void {
        super.teardown();

        this.noteContainer.teardown();
    }
}
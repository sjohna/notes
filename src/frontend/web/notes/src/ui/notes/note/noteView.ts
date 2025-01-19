import {NoteColumnView} from "./noteColumnView";
import {NoteFilterView} from "./noteFilterView";
import {services} from "../../../service/services";
import {
    button,
    CompositeComponentBase,
    Div,
    div,
    flexColumn, flexRow,
    textArea
} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";

export class NoteView extends CompositeComponentBase {
    noteContainer: Div;
    newNoteText: HTMLTextAreaElement;

    private filterContainer: Div;

    constructor() {
        super(div());

        const infoDiv = div()

        flexRow().withChildren(
            [
                button('New Note')
                    .onclick(() => {services.noteService.createNote(this.newNoteText.value); this.newNoteText.value = '';}),
                infoDiv,
            ]
        )
            .gap("4px")
            .in(this.root);

        this.onTeardown(unsubscribe(
                services.generalService.generalInfo$.subscribe(info => infoDiv.innerText(info.documentCount + " total notes.")
            )
        ))

        const newNoteTextBuilder = textArea()
            .keydown((event: KeyboardEvent) => {
                if (event.ctrlKey && event.code == "Enter") {
                    services.noteService.createNote(this.newNoteText.value);
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

        new NoteFilterView().in(this.filterContainer);

        this.noteContainer = flexColumn()
            .in(this.root)
            .flexGrow('1')
            .overflowY('auto')
            .paddingRight('20px')
            .paddingBottom('8px');

        new NoteColumnView().in(this.noteContainer);
    }

    public teardown(): void {
        super.teardown();

        this.noteContainer.teardown();
    }
}
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
import {NoteCardView} from "./noteCardView";

export class NoteView extends CompositeComponentBase {
    noteContainer: Div;
    newNoteText: HTMLTextAreaElement;

    private filterContainer: Div;
    private infoDiv: Div;

    constructor() {
        super(div());

        const navState = services.navService.currentState();

        if(navState.id) {
            services.noteService.getNote(navState.id)

            this.renderSingleNote();
        } else {
            this.renderNoteList()
        }
    }

    private renderSingleNote() {
        this.onTeardown(unsubscribe(
            services.noteService.currentNote$.subscribe(    // TODO: simple filter for not null for all subscriptions like this
                (note) => {
                    console.log('single note got')
                    if (note) {
                        // TODO: maybe another component for this?
                        this.noteContainer = flexColumn()
                            .withChildren([
                                div('Created at ' + note.document.createdAt),
                                div('Updated at ' + '<gotta implement this>'),
                                div('Version ' + note.versionHistory.length),   // TODO: actually display the latest version
                                new NoteCardView(note.document),
                            ])
                            .in(this.root)
                    }
                }
            )
        ))
    }

    private renderNoteList() {
        this.infoDiv = div();

        this.onTeardown(unsubscribe(
            services.generalService.generalInfo$.subscribe((info) =>
                {
                    if (info) {
                        this.infoDiv.innerText(info.documentCount + " total notes.")
                    }
                }
            )
        ))

        flexRow().withChildren(
            [
                button('New Note')
                    .onclick(() => {services.noteService.createNote(this.newNoteText.value); this.newNoteText.value = '';}),
                this.infoDiv,
            ]
        )
            .gap("4px")
            .in(this.root);

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

        this.noteContainer?.teardown();
    }
}
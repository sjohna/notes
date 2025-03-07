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
            services.noteService.getNote(navState.id);

            this.renderSingleNote(navState.version);
        } else {
            this.renderNoteList()
        }
    }

    private renderSingleNote(version: number) {
        this.onTeardown(unsubscribe(
            services.noteService.currentNote$.subscribe(    // TODO: simple filter for not null for all subscriptions like this
                (note) => {
                    // TODO: handle in progress and error
                    if (note) {
                        console.log('Rendering note', note)
                        let selectedVersion = version || note.data.versionHistory.length

                        // TODO: maybe another component for this?
                        this.noteContainer = flexColumn()
                            .in(this.root)

                        div('Created at ' + note.data.document.createdAt).in(this.noteContainer)
                        div('Updated at ' + '<gotta implement this>').in(this.noteContainer)
                        div('Current Version: ' + note.data.versionHistory.length).in(this.noteContainer)

                        if (version) {
                            div('Back to latest version')
                                .onclick(() => {
                                    services.navService.navigate('note', note.data.document.id, null)
                                })
                        }

                        for (const version of note.data.versionHistory) {
                            const versionDiv = div(version.createdAt + ': ' + version.contentLength + ' bytes')
                            if(version.version === selectedVersion) {
                                versionDiv.background('gray')
                            } else {
                                versionDiv.onclick(() => {
                                    services.navService.navigate('note', note.data.document.id, version.version)
                                })
                                    .cursor('pointer')
                            }

                            versionDiv.in(this.noteContainer)
                        }

                        if (!version) {
                            new NoteCardView(note.data.document).in(this.noteContainer)
                        } else {
                            // TODO: state management
                            services.noteService.getNoteVersion(note.data.document.id, version)

                            this.onTeardown(unsubscribe(services.noteService.currentNoteVersion$.subscribe(
                                (version) => {
                                    // TODO: handle in progress and error
                                    if (version) {
                                        div('Version ' + version.data.version + ' created at ' + version.data.createdAt).in(this.noteContainer)
                                        div(version.data.content)
                                            .width('300px')
                                            .in(this.noteContainer)
                                    }
                                }
                            )))
                        }
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
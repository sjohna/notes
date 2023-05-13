import {
    AnyBuilder,
    clear,
    DivBuilder,
    button,
    div,
    textArea, flexColumn,
} from "../../../utility/element";
import {View} from "../../../utility/view";
import {NoteColumnView} from "./noteColumnView";
import {NoteCalendarView} from "./noteCalendarView";
import {LabeledCheckbox} from "../../component/labeledCheckbox";
import {NoteFilterView} from "./noteFilterView";
import {Services} from "../../../service/services";

export class NoteView implements View {
    noteContainer: DivBuilder;
    newNoteText: HTMLTextAreaElement;

    private noteView: View;

    private filterContainer: DivBuilder;
    private filterView: View;

    private calendarViewCheckbox: LabeledCheckbox;

    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) { }

    public setup(): void {
        clear(this.container);
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

        this.newNoteText = newNoteTextBuilder.element();

        newNoteTextBuilder
            .inDiv()
            .in(this.container);

        this.filterContainer = div()
            .in(this.container);

        this.filterView?.teardown();
        this.filterView = new NoteFilterView(this.filterContainer, this.s);
        this.filterView.setup();

        this.calendarViewCheckbox = new LabeledCheckbox('Calendar View')
            .in(this.container)
            .onchange((ev: Event) => {
                this.renderNotes();
            });

        this.noteContainer = flexColumn()
            .in(this.container)
            .flexGrow('1')
            .overflowY('auto')
            .paddingRight('20px')
            .paddingBottom('8px');

        this.renderNotes();
    }

    public teardown(): void {
        this.noteView?.teardown();
    }

    private renderNotes() {
        this.noteView?.teardown();
        if (this.calendarViewCheckbox.checked) {
            this.noteView = new NoteCalendarView(this.noteContainer, this.s);
        } else {
            this.noteView = new NoteColumnView(this.noteContainer, this.s);
        }
        this.noteView.setup();
    }
}
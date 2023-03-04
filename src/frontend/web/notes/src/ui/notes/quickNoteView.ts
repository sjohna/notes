import {
    AnyBuilder,
    clear,
    DivBuilder,
    button,
    div,
    textArea,
} from "../../utility/element";
import {View} from "../../utility/view";
import {QuickNoteColumnView} from "./quickNoteColumnView";
import {QuickNoteCalendarView} from "./quickNoteCalendarView";
import {LabeledCheckbox} from "../component/labeledCheckbox";
import {QuickNotesFilterView} from "./quickNotesFilterView";
import {QuickNoteService} from "../../service/quickNoteService";
import {DocumentFilterService} from "../../service/documentFilterService";
import {TotalQuickNotesOnDateService} from "../../service/totalQuickNotesOnDateService";
import {TagService} from "../../service/tagService";

export class QuickNoteView implements View {
    noteContainer: DivBuilder;
    newNoteText: HTMLTextAreaElement;

    private noteView: View;

    private filterContainer: DivBuilder;
    private filterView: View;

    private calendarViewCheckbox: LabeledCheckbox;

    constructor(
        private container: AnyBuilder,
        private quickNotes: QuickNoteService,
        private totalQuickNotesOnDates: TotalQuickNotesOnDateService,
        private documentFilters: DocumentFilterService,
        private tags: TagService,
    ) { }

    public setup(): void {
        clear(this.container);
        button('New Note')
            .onclick(() => {this.quickNotes.createNote(this.newNoteText.value); this.newNoteText.value = '';})
            .inDiv()
            .in(this.container);

        const newNoteTextBuilder = textArea()
            .keydown((event: KeyboardEvent) => {
                if (event.ctrlKey && event.code == "Enter") {
                    this.quickNotes.createNote(this.newNoteText.value);
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
        this.filterView = new QuickNotesFilterView(this.filterContainer, this.documentFilters);
        this.filterView.setup();

        this.calendarViewCheckbox = new LabeledCheckbox('Calendar View')
            .in(this.container)
            .onchange((ev: Event) => {
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
        if (this.calendarViewCheckbox.checked) {
            this.noteView = new QuickNoteCalendarView(this.noteContainer, this.totalQuickNotesOnDates, this.quickNotes, this.documentFilters, this.tags);
        } else {
            this.noteView = new QuickNoteColumnView(this.noteContainer, this.quickNotes, this.documentFilters, this.tags);
        }
        this.noteView.setup();
    }
}
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {quickNotes$, Document, fetchQuickNotes, createNote} from "../service/quickNotes";
import {clear, ElementBuilder, newButton, newDiv, newHr, newSpan, newTextArea} from "../utility/element";
import {SubViewCollection, View} from "../utility/view";
import {Subscription} from "rxjs";
import {QuickNoteScrollColumnView} from "./quickNoteScrollColumnView";

export class QuickNoteView implements View {
    noteContainer: HTMLDivElement;
    newNoteText: HTMLTextAreaElement;
    quickNotesSubscription?: Subscription;

    private noteView: View;

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

        this.noteContainer = newDiv()
            .in(this.container)
            .element();

        this.quickNotesSubscription = quickNotes$.subscribe(notes => this.renderNotes(notes));
    }

    public teardown(): void {
        this.quickNotesSubscription?.unsubscribe();
        this.noteView?.teardown();
    }

    private renderNotes(notes: Document[]) {
        this.noteView?.teardown();
        this.noteView = new QuickNoteScrollColumnView(this.noteContainer, notes);
        this.noteView.setup();
    }
}
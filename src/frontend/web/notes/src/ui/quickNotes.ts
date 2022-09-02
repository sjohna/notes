import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {quickNotes$, Document, fetchQuickNotes, createNote} from "../service/quickNotes";
import {ElementBuilder, newButton, newDiv, newHr, newSpan, newTextArea} from "../utility/element";
import {View} from "../utility/view";

export class QuickNoteView implements View {
    noteContainer: HTMLDivElement;
    newNoteText: HTMLTextAreaElement;

    constructor(private container: HTMLElement) { }

    public setup(): void {
        this.renderQuickNotes();
    }

    public teardown(): void {}

    private renderQuickNotes() {
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

        quickNotes$.subscribe(notes => this.renderNotes(notes));
    }

    private renderNotes(notes: Document[]) {
        while (this.noteContainer.firstChild) {
            this.noteContainer.removeChild(this.noteContainer.firstChild)
        }

        let lastDate: string | undefined;

        for (let note of notes) {
            const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
            const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
            if (createdDate != lastDate) {
                this.noteContainer.appendChild(this.dateHeader(createdDate));

                lastDate = createdDate;
            }

            this.noteContainer.appendChild(this.noteCard(note));
        }
    }

    private dateHeader(date: string): HTMLDivElement {
        return newDiv()
            .width('380px')
            .display('inline-flex')
            .marginHorizontal('8px')
            .padding('4px')
            .withChild( // left line
                newHr()
                    .flexGrow('1')
                    .element()
            )
            .withChild( // date
                newSpan()
                    .marginHorizontal('24px')
                    .innerText(date)
                    .element()
            )
            .withChild( // right line
                newHr()
                    .flexGrow('1')
                    .element()
            )
            .element();
    }

    private noteCard(note: Document): HTMLDivElement {
        const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('h:m a').withLocale(Locale.US));

        return newDiv()
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChild( // time
                newDiv()
                    .innerText(createdTimeString)
                    .fontSize('12px')
                    .element()
            )
            .withChild( // content
                newDiv()
                    .innerText(note.content)
                    .element()
            )
            .element()
    }
}
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {quickNotes$, Document, fetchQuickNotes, createNote} from "../service/quickNotes";
import {ElementBuilder, newButton, newDiv, newHr, newSpan, newTextArea} from "../utility/element";

let noteContainer: HTMLDivElement;
let newNoteText: HTMLTextAreaElement;

export function renderQuickNotes(container: HTMLDivElement) {
    newButton()
        .innerText('New Note')
        .onclick(() => {createNote(newNoteText.value); newNoteText.value = '';})
        .inDiv()
        .in(container);

    const newNoteTextBuilder = newTextArea()
        .keydown((event: KeyboardEvent) => {
            if (event.ctrlKey && event.code == "Enter") {
                createNote(newNoteText.value);
                newNoteText.value = '';
            }
        })
        .margin("8px")
        .width("380px");

    newNoteText = newNoteTextBuilder.element();

    newNoteTextBuilder
        .inDiv()
        .in(container)
        .element();

    noteContainer = newDiv()
        .in(container)
        .element();

    quickNotes$.subscribe(notes => renderNotes(noteContainer, notes));
}

function renderNotes(noteContainer: HTMLDivElement, notes: Document[]) {
    while (noteContainer.firstChild) {
        noteContainer.removeChild(noteContainer.firstChild)
    }

    let lastDate: string | undefined;

    for (let note of notes) {
        const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
        if (createdDate != lastDate) {
            noteContainer.appendChild(dateHeader(createdDate));

            lastDate = createdDate;
        }

        noteContainer.appendChild(noteCard(note));
    }
}

function dateHeader(date: string): HTMLDivElement {
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

function noteCard(note: Document): HTMLDivElement {
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
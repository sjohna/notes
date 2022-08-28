import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {quickNotes$, Document, fetchQuickNotes, createNote} from "../service/quickNotes";
import {divAround, newDiv} from "../utility/element";

let noteContainer: HTMLDivElement;
let newNoteText: HTMLTextAreaElement;

export function renderQuickNotes(container: HTMLDivElement) {
    const newNoteButton = document.createElement('button') as HTMLButtonElement;
    newNoteButton.innerText = 'New Note';
    newNoteButton.onclick = () => {createNote(newNoteText.value); newNoteText.value = '';};
    container.appendChild(divAround(newNoteButton));

    newNoteText = document.createElement('textarea') as HTMLTextAreaElement;

    newNoteText.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.ctrlKey && event.code == "Enter") {
            createNote(newNoteText.value);
            newNoteText.value = '';
        }
    });

    newNoteText.style.margin = "8px";
    newNoteText.style.width = "380px";

    noteContainer = newDiv();

    container.appendChild(divAround(newNoteText));
    container.appendChild(noteContainer);

    quickNotes$.subscribe(notes => renderNotes(noteContainer, notes));
}

function renderNotes(noteContainer: HTMLDivElement, notes: Document[]) {
    while (noteContainer.firstChild) {
        noteContainer.removeChild(noteContainer.firstChild)
    }

    let lastDate: string | undefined;

    for (let note of notes) {
        const noteDiv = noteCard(note);

        const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
        if (createdDate != lastDate) {
            noteContainer.appendChild(dateHeader(createdDate));

            lastDate = createdDate;
        }

        noteContainer.appendChild(noteDiv);
    }
}

function dateHeader(date: string) {
    const dateLineDiv = newDiv();

    dateLineDiv.style.width = '380px';
    dateLineDiv.style.display = 'inline-flex';
    dateLineDiv.style.marginLeft = '8px';
    dateLineDiv.style.marginRight = '8px';
    dateLineDiv.style.padding = '4px';

    const leftLine = document.createElement('hr');
    leftLine.style.flexGrow = '1';
    const text = document.createElement('span') as HTMLSpanElement;
    text.style.marginLeft = '24px';
    text.style.marginRight = '24px';
    const rightLine = document.createElement('hr');
    rightLine.style.flexGrow = '1';

    text.innerText = date;
    dateLineDiv.appendChild(leftLine);
    dateLineDiv.appendChild(text);
    dateLineDiv.appendChild(rightLine);

    return dateLineDiv;
}

function noteCard(note: Document): HTMLDivElement {
    const noteCardDiv = newDiv();

    noteCardDiv.style.background = 'lightgray';
    noteCardDiv.style.margin = '8px';
    noteCardDiv.style.padding = '4px';
    noteCardDiv.style.width = '380px';
    noteCardDiv.style.borderRadius = '10px';

    const createdTime = newDiv();
    const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
    createdTime.innerText = createdDateTime.format(DateTimeFormatter.ofPattern('h:m a').withLocale(Locale.US));
    createdTime.style.fontSize = '12px';

    noteCardDiv.appendChild(createdTime);

    const contentDiv = newDiv();
    contentDiv.innerText = note.content;

    noteCardDiv.appendChild(contentDiv);

    return noteCardDiv;
}
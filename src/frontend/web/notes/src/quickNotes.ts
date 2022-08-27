import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";

interface Document {
    content: string;
    createdAt: string;
    id: number;
    type: string;
}

let noteContainer: HTMLDivElement;
let newNoteText: HTMLTextAreaElement;

export function renderQuickNotes(container: HTMLDivElement) {
    newNoteText = document.createElement('textarea') as HTMLTextAreaElement;
    const newNoteTextDiv = document.createElement('div') as HTMLDivElement;
    newNoteTextDiv.appendChild(newNoteText);

    const newNoteButton = document.createElement('button') as HTMLButtonElement;
    const newNoteButtonDiv = document.createElement('div') as HTMLDivElement;
    newNoteButtonDiv.appendChild(newNoteButton);
    newNoteButton.innerText = 'New Note';

    newNoteText.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.ctrlKey && event.code == "Enter") {
            createNote();
        }
    });

    newNoteText.style.margin = "8px";
    newNoteText.style.width = "380px";

    newNoteButton.onclick = createNote;

    noteContainer = document.createElement('div') as HTMLDivElement;

    container.appendChild(newNoteButtonDiv);
    container.appendChild(newNoteTextDiv);
    container.appendChild(noteContainer);

    fetchNotes();
}

function fetchNotes() {
    fetch('http://localhost:3000/quicknote', {
        'method': 'GET'
    })
        .then(async response => renderNotes(noteContainer, await response.json() as Document[]))
        .catch(err => console.log(err))
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
    const dateLineDiv = document.createElement('div') as HTMLDivElement;

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
    const noteCardDiv = document.createElement('div') as HTMLDivElement;

    noteCardDiv.style.background = 'lightgray';
    noteCardDiv.style.margin = '8px';
    noteCardDiv.style.padding = '4px';
    noteCardDiv.style.width = '380px';
    noteCardDiv.style.borderRadius = '10px';

    const createdTime = document.createElement('div') as HTMLDivElement;
    const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
    createdTime.innerText = createdDateTime.format(DateTimeFormatter.ofPattern('h:m a').withLocale(Locale.US));
    createdTime.style.fontSize = '12px';

    noteCardDiv.appendChild(createdTime);

    const contentDiv = document.createElement('div') as HTMLDivElement;
    contentDiv.innerText = note.content;

    noteCardDiv.appendChild(contentDiv);

    return noteCardDiv;
}

export function createNote() {
    const content = newNoteText.value;
    if (!content) {
        return;
    }

    fetch('http://localhost:3000/quicknote', {
        'method': 'POST',
        'body': JSON.stringify({content})
    })
        .then(() => {fetchNotes(); newNoteText.value = '';} )
        .catch(err => console.log(err))
}
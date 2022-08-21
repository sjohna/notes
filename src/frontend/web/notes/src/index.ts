import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import "@js-joda/timezone";
import { Locale } from '@js-joda/locale_en-us';

interface Document {
    content: string;
    createdAt: string;
    id: number;
    type: string;
}

const container = document.getElementById('container') as HTMLDivElement;
const newNoteText = document.getElementById('newNoteText') as HTMLTextAreaElement;
const button = document.getElementById('newNoteButton') as HTMLButtonElement;
button.onclick = createNote;

fetchNotes();

function fetchNotes() {
    fetch('http://localhost:3000/quicknote', {
        'method': 'GET'
    })
        .then(async response => renderNotes(await response.json() as Document[]))
        .catch(err => console.log(err))
}

function renderNotes(notes: Document[]) {
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }

    for (let note of notes) {
        const noteContainer = document.createElement('div') as HTMLDivElement;

        noteContainer.style.background = 'lightgray';
        noteContainer.style.margin = '8px';
        noteContainer.style.padding = '4px';
        noteContainer.style.width = '380px'
        noteContainer.style.borderRadius = '10px';

        const createdTime = document.createElement('div') as HTMLDivElement;
        const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        createdTime.innerText = createdDateTime.format(DateTimeFormatter.ofPattern('h:m a').withLocale(Locale.US));
        createdTime.style.fontSize = '12px';

        noteContainer.appendChild(createdTime)

        const contentDiv = document.createElement('div') as HTMLDivElement;
        contentDiv.innerText = note.content;

        noteContainer.appendChild(contentDiv);

        container.appendChild(noteContainer);
    }
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
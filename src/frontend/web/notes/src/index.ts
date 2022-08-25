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

newNoteText.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.ctrlKey && event.code == "Enter") {
        createNote();
    }
});

newNoteText.style.margin = "8px";
newNoteText.style.width = "380px";

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

    let lastDate: string | undefined;

    for (let note of notes) {
        const noteContainer = document.createElement('div') as HTMLDivElement;

        noteContainer.style.background = 'lightgray';
        noteContainer.style.margin = '8px';
        noteContainer.style.padding = '4px';
        noteContainer.style.width = '380px';
        noteContainer.style.borderRadius = '10px';

        const createdTime = document.createElement('div') as HTMLDivElement;
        const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
        if (createdDate != lastDate) {
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

            text.innerText = createdDate;
            dateLineDiv.appendChild(leftLine);
            dateLineDiv.appendChild(text);
            dateLineDiv.appendChild(rightLine);

            container.appendChild(dateLineDiv);

            lastDate = createdDate;
        }

        createdTime.innerText = createdDateTime.format(DateTimeFormatter.ofPattern('h:m a').withLocale(Locale.US));
        createdTime.style.fontSize = '12px';

        noteContainer.appendChild(createdTime);

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
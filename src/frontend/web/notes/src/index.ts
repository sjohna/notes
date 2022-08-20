interface Document {
    content: string;
    createdAt: string;
    id: number;
    type: string;
}

const container = document.getElementById('container');

console.log('getting notes')
fetch('http://localhost:3000/quicknote', {
    'method': 'GET'
})
.then(async response => renderNotes(await response.json() as Document[]))
.catch(err => console.log(err))

function renderNotes(notes: Document[]) {
    for (let note of notes) {
        const noteContainer = document.createElement('div') as HTMLDivElement;

        noteContainer.style.background = 'lightgray';
        noteContainer.style.margin = '8px';
        noteContainer.style.padding = '4px';
        noteContainer.style.width = '380px'
        noteContainer.style.borderRadius = '10px';

        const createdTime = document.createElement('div') as HTMLDivElement;
        createdTime.innerText = new Intl.DateTimeFormat('en').format(Date.parse(note.createdAt));
        createdTime.style.fontSize = '12px';

        noteContainer.appendChild(createdTime)

        const contentDiv = document.createElement('div') as HTMLDivElement;
        contentDiv.innerText = note.content;

        noteContainer.appendChild(contentDiv);

        container.appendChild(noteContainer);

    }
}
export function divAround(element: HTMLElement): HTMLDivElement {
    const div = newDiv()
    div.appendChild(element);
    return div;
}

export function newDiv(): HTMLDivElement {
    return document.createElement('div') as HTMLDivElement;
}
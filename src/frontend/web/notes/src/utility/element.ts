export class ElementBuilder<E extends HTMLElement> {
    private readonly el: E;

    constructor(element: E) {
        this.el = element;
    }

    public element(): E {
        return this.el;
    }

    public withChild(child: HTMLElement): ElementBuilder<E> {
        this.el.appendChild(child);
        return this;
    }

    public inDiv(): ElementBuilder<HTMLDivElement> {
        return newDiv().withChild(this.el);
    }

    public in(parent: HTMLElement): ElementBuilder<E> {
        parent.appendChild(this.el);
        return this;
    }

    public innerText(text: string): ElementBuilder<E> {
        this.el.innerText = text;
        return this;
    }

    public onclick(handler: (ev?: MouseEvent) => void): ElementBuilder<E> {
        this.el.onclick = handler;
        return this;
    }

    // TODO: figure out the correct type for the event handler
    public onchange(handler: (ev?:  Event) => void): ElementBuilder<E> {
        this.el.onchange = handler;
        return this;
    }

    public keydown(handler: (ev?: KeyboardEvent) => void): ElementBuilder<E> {
        this.el.addEventListener('keydown', handler);
        return this;
    }

    // style functions
    public padding(s: string): ElementBuilder<E> {
        this.el.style.padding = s;
        return this;
    }

    public margin(s: string): ElementBuilder<E> {
        this.el.style.margin = s;
        return this;
    }

    public marginHorizontal(s: string): ElementBuilder<E> {
        this.el.style.marginLeft = s;
        this.el.style.marginRight = s;
        return this;
    }

    public width(s: string): ElementBuilder<E> {
        this.el.style.width = s;
        return this;
    }

    public height(s: string): ElementBuilder<E> {
        this.el.style.height = s;
        return this;
    }

    public display(s: string): ElementBuilder<E> {
        this.el.style.display = s;
        return this;
    }

    public flexGrow(s: string): ElementBuilder<E> {
        this.el.style.flexGrow = s;
        return this;
    }

    public flexDirection(s: string): ElementBuilder<E> {
        this.el.style.flexDirection = s;
        return this;
    }

    public background(s: string): ElementBuilder<E> {
        this.el.style.background = s;
        return this;
    }

    public borderRadius(s: string): ElementBuilder<E> {
        this.el.style.borderRadius = s;
        return this;
    }

    public fontSize(s: string): ElementBuilder<E> {
        this.el.style.fontSize = s;
        return this;
    }
}

export function newTextArea(): ElementBuilder<HTMLTextAreaElement> {
    return new ElementBuilder(document.createElement('textarea') as HTMLTextAreaElement);
}

export function newButton(): ElementBuilder<HTMLButtonElement> {
    return new ElementBuilder(document.createElement('button') as HTMLButtonElement);
}

export function newDiv(): ElementBuilder<HTMLDivElement> {
    return new ElementBuilder(document.createElement('div') as HTMLDivElement);
}

export function newSpan(): ElementBuilder<HTMLSpanElement> {
    return new ElementBuilder(document.createElement('span') as HTMLSpanElement);
}
export function newHr(): ElementBuilder<HTMLHRElement> {
    return new ElementBuilder(document.createElement('hr') as HTMLHRElement);
}

export function newCheckbox(): ElementBuilder<HTMLInputElement> {
    const element = document.createElement('input') as HTMLInputElement;
    element.type = 'checkbox';
    return new ElementBuilder(element);
}

export function clear(element: HTMLElement): void {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}
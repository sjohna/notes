export class ElementBuilder<E extends HTMLElement> {
    private readonly el: E;

    constructor(element: E) {
        this.el = element;
    }

    public element(): E {
        return this.el;
    }

    public withChildElement(child: HTMLElement): ElementBuilder<E> {
        this.el.appendChild(child);
        return this;
    }

    public withChild(child: AnyBuilder): ElementBuilder<E> {
        return this.withChildElement(child.element());
    }

    public withChildren(children: Array<AnyBuilder>): ElementBuilder<E> {
        for (let child of children) {
            this.withChild(child);
        }
        return this;
    }

    public inDiv(): ElementBuilder<HTMLDivElement> {
        return div().withChild(this);
    }

    public in<P extends HTMLElement>(parent: ElementBuilder<P>): ElementBuilder<E> {
        parent.withChild(this);
        return this;
    }

    public inElement(parent: HTMLElement): ElementBuilder<E> {
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

    public marginVertical(s: string): ElementBuilder<E> {
        this.el.style.marginTop = s;
        this.el.style.marginBottom = s;
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

    public cursor(s: string): ElementBuilder<E> {
        this.el.style.cursor = s;
        return this;
    }

    public textAlign(s: string): ElementBuilder<E> {
        this.el.style.textAlign = s;
        return this;
    }

    public border(s: string): ElementBuilder<E> {
        this.el.style.border = s;
        return this;
    }

    public clone(innerText?: string): ElementBuilder<E> {
        const builder = new ElementBuilder<E>(this.element().cloneNode() as E);
        if (innerText !== undefined && innerText !== null) {
            builder.innerText(innerText);
        }
        return builder;
    }
}

export type AnyBuilder = ElementBuilder<HTMLElement>;
export type DivBuilder = ElementBuilder<HTMLDivElement>;
export type InputBuilder = ElementBuilder<HTMLInputElement>;

export function input(): ElementBuilder<HTMLInputElement> {
    return new ElementBuilder(document.createElement('input') as HTMLInputElement);
}

export function textArea(): ElementBuilder<HTMLTextAreaElement> {
    return new ElementBuilder(document.createElement('textarea') as HTMLTextAreaElement);
}

export function button(innerText?: string): ElementBuilder<HTMLButtonElement> {
    const builder = new ElementBuilder(document.createElement('button') as HTMLButtonElement);
    if (innerText !== undefined && innerText !== null) {
        builder.innerText(innerText);
    }
    return builder;
}

export function div(innerText?: string): ElementBuilder<HTMLDivElement> {
    const builder = new ElementBuilder(document.createElement('div') as HTMLDivElement);
    if (innerText !== undefined && innerText !== null) {
        builder.innerText(innerText);
    }
    return builder;
}

export function flexRow(): ElementBuilder<HTMLDivElement> {
    return new ElementBuilder(document.createElement('div') as HTMLDivElement)
        .display('flex')
        .flexDirection('row');
}

export function span(innerText?: string): ElementBuilder<HTMLSpanElement> {
    const builder = new ElementBuilder(document.createElement('span') as HTMLDivElement);
    if (innerText !== undefined && innerText !== null) {
        builder.innerText(innerText);
    }
    return builder;
}
export function hr(): ElementBuilder<HTMLHRElement> {
    return new ElementBuilder(document.createElement('hr') as HTMLHRElement);
}

export function newCheckbox(): ElementBuilder<HTMLInputElement> {
    const element = document.createElement('input') as HTMLInputElement;
    element.type = 'checkbox';
    return new ElementBuilder(element);
}

export function clear(builder: AnyBuilder): void {
    clearElement(builder.element());
}

export function clearElement(element: HTMLElement): void {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}
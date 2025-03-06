import {Drop} from "./drop";

export type TeardownCallback = () => void;

export interface Component {
    teardown(): void;
    onTeardown(callback: () => void): void; // TODO: consider a mechanism that allows for removal

    in(parent: ContainerComponent): this;
}

export interface RootedComponent<R extends HTMLElement> extends Component {
    inElement(parent: HTMLElement): this;
    focus(): this;
    scrollIntoView(): this;
    drop(d: Drop): this;
    get rootElement(): R;
}

export interface ContainerComponent extends Component {
    withChild(child: Component): this;
    withChildren(children: Component[]): this;
    clear(): this;
}

export abstract class ComponentBase implements Component {
    private teardownCallbacks: TeardownCallback[] = [];

    constructor() {}

    public teardown(): void {
        for (const callback of this.teardownCallbacks) {
            callback?.();
        }
    }

    public onTeardown(callback: () => void) {
        this.teardownCallbacks.push(callback);
    }

    public abstract in(parent: ContainerComponent): this;
}

export class RootedComponentBase<E extends HTMLElement> extends ComponentBase {
    constructor(protected readonly el: E) {
        super();
    }

    public in(parent: ContainerComponent): this {
        parent.withChild(this);
        return this;
    }

    public teardown(): void {
        this.el?.remove();
        super.teardown();
    }

    public get rootElement(): E {
        return this.el;
    }

    public inElement(parent: HTMLElement): this {
        parent.appendChild(this.rootElement);
        return this;
    }

    public focus(): this {
        this.el.focus();
        return this;
    }

    public scrollIntoView(): this {
        this.el.scrollIntoView();
        return this;
    }

    public drop(d: Drop): this {
        d.apply(this);
        return this;
    }

    public inDiv(): ElementComponent<HTMLDivElement> {
        return div().withChild(this);
    }

    public innerText(text: string): this {
        this.el.innerText = text;
        return this;
    }

    public onclick(handler: (ev?: MouseEvent) => void): this {
        this.el.onclick = handler;
        return this;
    }

    public onmouseover(handler: (ev?: MouseEvent) => void): this {
        this.el.onmouseover = handler;
        return this;
    }

    public onmouseenter(handler: (ev?: MouseEvent) => void): this {
        this.el.onmouseenter = handler;
        return this;
    }

    public onmouseleave(handler: (ev?: MouseEvent) => void): this {
        this.el.onmouseleave = handler;
        return this;
    }

    public onmousemove(handler: (ev?: MouseEvent) => void): this {
        this.el.onmousemove = handler;
        return this;
    }

    public onkeyup(handler: (ev?: KeyboardEvent) => void): this {
        this.el.onkeyup = handler;
        return this;
    }

    public ondragstart(handler: (ev: DragEvent) => void): this {
        this.el.draggable = true;
        this.el.ondragstart = handler;
        return this;
    }

    public ondragend(handler: (ev: DragEvent) => void): this {
        this.el.ondragend = handler;
        return this;
    }

    public ondragenter(handler: (ev: DragEvent) => void): this {
        this.el.ondragenter = handler;
        return this;
    }

    public ondragleave(handler: (ev: DragEvent) => void): this {
        this.el.ondragleave = handler;
        return this;
    }

    public ondragover(handler: (ev: DragEvent) => void): this {
        this.el.ondragover = handler;
        return this;
    }

    public ondrop(handler: (ev: DragEvent) => void): this {
        this.el.ondrop = handler;
        return this;
    }

    public onchange(handler: (ev?:  Event) => void): this { // this is a generic event
        this.el.onchange = handler;
        return this;
    }

    public keydown(handler: (ev?: KeyboardEvent) => void): this {
        this.el.addEventListener('keydown', handler);
        return this;
    }

    // style functions
    public padding(s: string): this {
        this.el.style.padding = s;
        return this;
    }

    public paddingHorizontal(s: string): this{
        this.el.style.paddingLeft = s;
        this.el.style.paddingRight = s;
        return this;
    }

    public paddingLeft(s: string): this {
        this.el.style.paddingLeft = s;
        return this;
    }

    public paddingRight(s: string): this {
        this.el.style.paddingRight = s;
        return this;
    }

    public paddingVertical(s: string): this {
        this.el.style.paddingTop = s;
        this.el.style.paddingBottom = s;
        return this;
    }

    public paddingTop(s: string): this {
        this.el.style.paddingTop = s;
        return this;
    }

    public paddingBottom(s: string): this {
        this.el.style.paddingBottom = s;
        return this;
    }

    public margin(s: string): this {
        this.el.style.margin = s;
        return this;
    }

    public marginHorizontal(s: string): this {
        this.el.style.marginLeft = s;
        this.el.style.marginRight = s;
        return this;
    }

    public marginVertical(s: string): this {
        this.el.style.marginTop = s;
        this.el.style.marginBottom = s;
        return this;
    }

    public marginLeft(s: string): this {
        this.el.style.marginLeft = s;
        return this;
    }

    public marginRight(s: string): this {
        this.el.style.marginRight = s;
        return this;
    }

    public width(s: string): this {
        this.el.style.width = s;
        return this;
    }

    public height(s: string): this {
        this.el.style.height = s;
        return this;
    }

    public display(s: string): this {
        this.el.style.display = s;
        return this;
    }

    public flexGrow(s: string): this {
        this.el.style.flexGrow = s;
        return this;
    }

    public flexDirection(s: string): this {
        this.el.style.flexDirection = s;
        return this;
    }

    public gap(s: string) : this {
        this.el.style.gap = s;
        return this;
    }

    public background(s: string): this {
        this.el.style.background = s;
        return this;
    }

    public color(s: string): this {
        this.el.style.color = s;
        return this;
    }

    public borderRadius(s: string): this {
        this.el.style.borderRadius = s;
        return this;
    }

    public fontSize(s: string): this {
        this.el.style.fontSize = s;
        return this;
    }

    public fontWeight(s: string): this {
        this.el.style.fontWeight = s;
        return this;
    }

    public fontFamily(s: string): this {
        this.el.style.fontFamily = s;
        return this;
    }

    public cursor(s: string): this {
        this.el.style.cursor = s;
        return this;
    }

    public textAlign(s: string): this {
        this.el.style.textAlign = s;
        return this;
    }

    public border(s: string): this {
        this.el.style.border = s;
        return this;
    }

    public borderTop(s: string): this {
        this.el.style.borderTop = s;
        return this;
    }

    public borderBottom(s: string): this {
        this.el.style.borderBottom = s;
        return this;
    }

    public borderLeft(s: string): this {
        this.el.style.borderLeft = s;
        return this;
    }

    public borderRight(s: string): this {
        this.el.style.borderRight = s;
        return this;
    }

    public visibility(s: string): this {
        this.el.style.visibility = s;
        return this;
    }

    public justifyContent(s: string): this {
        this.el.style.justifyContent = s;
        return this;
    }

    public alignItems(s: string): this {
        this.el.style.alignItems = s;
        return this;
    }

    public overflow(s: string): this {
        this.el.style.overflow = s;
        return this;
    }

    public overflowX(s: string): this {
        this.el.style.overflowX = s;
        return this;
    }

    public overflowY(s: string): this {
        this.el.style.overflowY = s;
        return this;
    }

    public className(s: string): this {
        this.el.className = s;
        return this;
    }

    // attributes
    public draggable(): this {
        this.el.setAttribute('draggable', 'true');
        return this;
    }
}

export class RootedContainerComponentBase<E extends HTMLElement> extends RootedComponentBase<E> implements ContainerComponent {
    subcomponents: Component[] = [];

    public teardown() {
        for (const subcomponent of this.subcomponents) {
            subcomponent.teardown();
        }

        super.teardown();
    }

    public withChildren(children: RootedComponent<HTMLElement>[]): this {
        for (let child of children) {
            this.withChild(child);
        }

        return this;
    }

    public clear(): this {
        for (const subcomponent of this.subcomponents) {
            subcomponent.teardown();
        }

        clearElement(this.rootElement);

        return this;
    }

    public withChild(child: RootedComponent<HTMLElement>): this {
        this.subcomponents.push(child);
        this.rootElement.appendChild(child.rootElement);
        return this;
    }
}

export class ElementComponent<E extends HTMLElement> extends RootedContainerComponentBase<E>{
    public withChildElement(child: HTMLElement): this {
        this.rootElement.appendChild(child);
        return this;
    }
}

export class Input extends ElementComponent<HTMLInputElement> {
    public type(s: string): this {
        this.el.type = s;
        return this;
    }
}

// for components with a single subcomponent at the root
export class CompositeComponentBase extends RootedComponentBase<HTMLElement> {
    constructor(protected readonly root: RootedContainerComponentBase<HTMLElement>) {
        super(root.rootElement);
    }

    teardown(): void {
        this.root.teardown();
        super.teardown();
    }
}

export type Div = ElementComponent<HTMLDivElement>;
export type Span  = ElementComponent<HTMLSpanElement>;

export interface ValueComponent<T> extends RootedComponent<any> {
    value(v: T): this;
    getValue(): T;
    onchange(handler: (ev?: Event) => void): this;
}

export class TextInput extends Input implements ValueComponent<string> {
    constructor(element: HTMLInputElement) {
        super(element);
    }

    value(s: string): this {
        if (s !== undefined) {
            this.el.value = s;
        }
        return this;
    }

    getValue(): string {
        return this.el.value;
    }
}

export class Checkbox extends ElementComponent<HTMLInputElement> implements ValueComponent<boolean> {
    constructor(element: HTMLInputElement) {
        super(element);
    }

    value(b: boolean): this {
        this.el.checked = b;
        return this;
    }

    getValue(): boolean {
        return this.el.checked;
    }
}

export function div(innerText?: string): ElementComponent<HTMLDivElement> {
    const builder = new ElementComponent(document.createElement('div') as HTMLDivElement);
    if (innerText !== undefined && innerText !== null) {
        builder.innerText(innerText);
    }
    return builder;
}

export function textInput(): TextInput {
    const element = document.createElement('input') as HTMLInputElement;
    element.style.boxSizing = 'border-box'; // hardcode this, because not doing this is stupid
    return new TextInput(element);
}

export function textArea(): ElementComponent<HTMLTextAreaElement> {
    return new ElementComponent(document.createElement('textarea') as HTMLTextAreaElement);
}

export function button(innerText?: string): ElementComponent<HTMLButtonElement> {
    const builder = new ElementComponent(document.createElement('button') as HTMLButtonElement);
    if (innerText !== undefined && innerText !== null) {
        builder.innerText(innerText);
    }
    return builder;
}

export function flexRow(): Div {
    return new ElementComponent(document.createElement('div') as HTMLDivElement)
        .display('flex')
        .flexDirection('row');
}

export function inlineFlexRow(): Div {
    return new ElementComponent(document.createElement('div') as HTMLDivElement)
        .display('inline-flex')
        .flexDirection('row');
}

export function flexColumn(): Div {
    return new ElementComponent(document.createElement('div') as HTMLDivElement)
        .display('flex')
        .flexDirection('column');
}

export function inlineFlexColumn(): Div {
    return new ElementComponent(document.createElement('div') as HTMLDivElement)
        .display('inline-flex')
        .flexDirection('column');
}

export function span(innerText?: string): Span {
    const builder = new ElementComponent(document.createElement('span') as HTMLSpanElement);
    if (innerText !== undefined && innerText !== null) {
        builder.innerText(innerText);
    }
    return builder;
}

export function hr(): ElementComponent<HTMLHRElement> {
    return new ElementComponent(document.createElement('hr') as HTMLHRElement);
}

export function checkbox(): Checkbox {
    const element = document.createElement('input') as HTMLInputElement;
    element.type = 'checkbox';
    return new Checkbox(element);
}

export function clearElement(element: HTMLElement) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
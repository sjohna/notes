import {div, Div, ElementComponent, flexRow, input, Input} from "../../utility/component";


// TODO: bring over value component
export class LabeledTextInput {
    public container: Div;
    public inputEl: Input;
    public labelDiv: Div;

    constructor(label: string = null) {
        this.labelDiv = div().width('100px');
        if (label !== undefined && label !== null) {
            this.labelDiv.innerText(label);
        }
        this.inputEl = input().width('100%');

        this.container = flexRow()
            .width('400px')
            .withChildren([
                this.labelDiv,
                this.inputEl,
            ]);
    }

    public label(s: string): LabeledTextInput {
        this.labelDiv.innerText(s);
        return this;
    }

    public get value(): string {
        return this.inputEl.root().value;
    }

    public set value(value: string) {
        this.inputEl.root().value = value;
    }

    public in<P extends HTMLElement>(parent: ElementComponent<P>): LabeledTextInput {
        parent.withChild(this.container);
        return this;
    }
}
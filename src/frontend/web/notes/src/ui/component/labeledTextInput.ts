import {div, DivBuilder, ElementBuilder, flexRow, input, InputBuilder} from "../../utility/element";

export class LabeledTextInput {
    public container: DivBuilder;
    public inputEl: InputBuilder;
    public labelDiv: DivBuilder;

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
        return this.inputEl.element().value;
    }

    public set value(value: string) {
        this.inputEl.element().value = value;
    }

    public in<P extends HTMLElement>(parent: ElementBuilder<P>): LabeledTextInput {
        parent.withChild(this.container);
        return this;
    }
}
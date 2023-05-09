import {checkbox, div, DivBuilder, ElementBuilder, flexRow, InputBuilder} from "../../utility/element";

export class LabeledCheckbox {
    public checkboxContainer: DivBuilder;
    public checkbox: InputBuilder;
    public labelDiv: DivBuilder;
    
    constructor(label: string = null) {
        this.checkbox = checkbox();
        this.labelDiv = div();
        if (label !== undefined && label !== null) {
            this.labelDiv.innerText(label);
        }

        this.checkboxContainer = flexRow()
            .withChildren([
                this.checkbox,
                this.labelDiv
            ]);
    }

    public label(s: string): LabeledCheckbox {
        this.labelDiv.innerText(s);
        return this;
    }

    public onchange(handler: (ev?:  Event) => void): LabeledCheckbox {
        this.checkbox.onchange(handler);
        return this;
    }

    public get checked(): boolean {
        return this.checkbox.element().checked;
    }

    public set checked(value: boolean) {
        this.checkbox.element().checked = value;
    }

    public in<P extends HTMLElement>(parent: ElementBuilder<P>): LabeledCheckbox {
        parent.withChild(this.checkboxContainer);
        return this;
    }
}
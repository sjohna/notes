import {checkbox, Div, div, ElementComponent, flexRow, Input} from "../../utility/component";

export class LabeledCheckbox {
    public checkboxContainer: Div;
    public checkbox: Input;
    public labelDiv: Div;
    
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
        return this.checkbox.root().checked;
    }

    public set checked(value: boolean) {
        this.checkbox.root().checked = value;
    }

    public in<P extends HTMLElement>(parent: ElementComponent<P>): LabeledCheckbox {
        parent.withChild(this.checkboxContainer);
        return this;
    }
}
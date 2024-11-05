import {
    checkbox,
    CompositeComponentBase,
    div,
    flexRow,
    ValueComponent
} from "../../utility/component";

export function labelledCheckBox(label: string, checked: boolean): ValueComponent<boolean> {
    const el = checkbox().value(checked);
    const root = flexRow().width('400px').withChildren([
        el,
        div(label)
    ])

    return new class extends CompositeComponentBase implements ValueComponent<boolean> {
        getValue(): boolean {
            return el.getValue();
        }

        value(s: boolean): this {
            el.value(s);
            return this;
        }

        focus(): this {
            el.focus();
            return this;
        }

        onchange(handler: (ev?: Event) => void): this {
            el.onchange(handler);
            return this;
        }
    }(root)
}
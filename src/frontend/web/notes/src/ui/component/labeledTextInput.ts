import {
    Component,
    CompositeComponentBase,
    div,
    flexRow, RootedContainerComponentBase,
    textInput,
    ValueComponent
} from "../../utility/component";

export function labelledTextBox(label: string, defaultValue?: string): ValueComponent<string> {
    const textBox = textInput().value(defaultValue);
    const root = flexRow().width('400px').withChildren([
        div(label).width('100px'),
        textBox
    ])

    return component(root, textBox);
}

export function labelledPasswordInput(label: string): ValueComponent<string> {
    const textBox = textInput().type('password');
    const root = flexRow().width('400px').withChildren([
        div(label).width('100px'),
        textBox,
    ])

    return component(root, textBox);
}

function component<T>(root: RootedContainerComponentBase<any>, input: ValueComponent<T>): ValueComponent<T> {
    return new class extends CompositeComponentBase implements ValueComponent<T> {
        getValue(): T {
            return input.getValue();
        }

        value(s: T): this {
            input.value(s);
            return this;
        }

        focus(): this {
            input.focus();
            return this;
        }

        onchange(handler: (ev?: Event) => void): this {
            input.onchange(handler);
            return this;
        }
    }(root)
}
import {div, DivBuilder} from "../../utility/element";

export function tagLabel(tagName: string): DivBuilder {
    return div(tagName)
        .fontSize('12px')
        .fontFamily('monospace')
        .fontWeight('bold')
        .paddingVertical('2px')
        .paddingHorizontal('4px')
        .background('white')
        .borderRadius('4px')
}
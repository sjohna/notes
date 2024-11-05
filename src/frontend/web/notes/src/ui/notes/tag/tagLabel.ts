import {div, Div} from "../../../utility/component";

export function tagLabel(tagName: string): Div {
    return div(tagName)
        .fontSize('12px')
        .fontFamily('monospace')
        .fontWeight('bold')
        .paddingVertical('2px')
        .paddingHorizontal('4px')
        .background('white')
        .borderRadius('4px')
}
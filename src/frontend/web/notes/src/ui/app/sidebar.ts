import {palette} from "../notes/paletteView";
import {div, RootedComponent} from "../../utility/component";

export function sidebar(): RootedComponent<any> {
    return div()
        .background('lightgray')
        .width('200px')
        .withChild(palette());
}
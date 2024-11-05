import {Services} from "../../service/services";
import {PaletteView} from "../notes/paletteView";
import {CompositeComponentBase, Div, div} from "../../utility/component";

export class SidebarView extends CompositeComponentBase {
    constructor(
        private s: Services,
    ) {
        super(div());

        div()
            .in(this.root)
            .background('lightgray')
            .width('200px')
            .withChild(new PaletteView(this.s));
    }
}
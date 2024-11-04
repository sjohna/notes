import {Services} from "../../service/services";
import {PaletteView} from "../notes/paletteView";
import {ComponentBase, Div, div} from "../../utility/component";

export class SidebarView extends ComponentBase {
    private container: Div = div();

    constructor(
        private s: Services,
    ) {
        super();

        div()
            .in(this.container)
            .background('lightgray')
            .width('200px')
            .withChild(new PaletteView(this.s));
    }

    public root(): HTMLElement {
        return this.container.root();
    }

    public teardown(): void {
        this.container?.teardown();
    }


}
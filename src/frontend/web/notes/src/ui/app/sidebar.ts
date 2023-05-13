import {View} from "../../utility/view";
import {AnyBuilder, div} from "../../utility/element";
import {TagPaletteView} from "../notes/tag/tagPaletteView";
import {Services} from "../../service/services";
import {PaletteView} from "../notes/paletteView";


export class SidebarView implements View {
    private palette: PaletteView;

    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    public setup(): void {
        const subContainer = div()
            .in(this.container)
            .background('lightgray')
            .width('200px')

        this.palette = new PaletteView(subContainer, this.s);

        this.palette.setup();
    }

    public teardown(): void {
        this.palette?.teardown();
    }


}
import {View} from "../../utility/view";
import {AnyBuilder, div} from "../../utility/element";
import {TagPaletteView} from "../notes/tagPaletteView";


export class SidebarView implements View {
    private palette: TagPaletteView;

    constructor(private container: AnyBuilder) {}

    public setup(): void {
        const subContainer = div()
            .in(this.container)
            .background('lightgray')
            .width('200px')

        div('Tags')
            .in(subContainer)
            .textAlign('center')

        this.palette = new TagPaletteView(subContainer);

        this.palette.setup();
    }

    public teardown(): void {
        this.palette?.teardown();
    }


}
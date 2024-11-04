import {Services} from "../../service/services";
import {TagPaletteView} from "./tag/tagPaletteView";
import {GroupPaletteView} from "./group/groupPaletteView";
import {ComponentBase, div, Div, inlineFlexColumn, Input, input} from "../../utility/component";

export class PaletteView extends ComponentBase {
    private container: Div = div();

    private searchBox: Input;

    private tagPalette: TagPaletteView;
    private groupPalette: GroupPaletteView;

    constructor(
        private s: Services,
    ) {
        super();

        this.searchBox = input()
            .in(this.container)
            .width('100%')
            .marginVertical('4px')
            .marginRight('8px')
            .onkeyup((ev: KeyboardEvent) => {
                this.tagPalette.setSearch(this.searchBox?.root()?.value);
                this.groupPalette.setSearch(this.searchBox?.root()?.value);
            })

        new TagPaletteView(this.s).in(this.container).width('100%');
        new GroupPaletteView(this.s).in(this.container).width('100%');
    }

    root(): HTMLElement {
        return this.container.root();
    }
}
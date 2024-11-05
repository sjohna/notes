import {Services} from "../../service/services";
import {TagPaletteView} from "./tag/tagPaletteView";
import {GroupPaletteView} from "./group/groupPaletteView";
import {CompositeComponentBase, div, TextInput, textInput} from "../../utility/component";

export class PaletteView extends CompositeComponentBase {
    private searchBox: TextInput;

    private tagPalette: TagPaletteView;
    private groupPalette: GroupPaletteView;

    constructor(
        private s: Services,
    ) {
        super(div());

        this.searchBox = textInput()
            .in(this.root)
            .width('100%')
            .marginVertical('4px')
            .marginRight('8px')
            .onkeyup((ev: KeyboardEvent) => {
                this.tagPalette.setSearch(this.searchBox?.rootElement?.value);
                this.groupPalette.setSearch(this.searchBox?.rootElement?.value);
            })

        new TagPaletteView(this.s).in(this.root).width('100%');
        new GroupPaletteView(this.s).in(this.root).width('100%');
    }
}
import {TagPaletteView} from "./tag/tagPaletteView";
import {GroupPaletteView} from "./group/groupPaletteView";
import {div, RootedComponent, textInput} from "../../utility/component";

export function palette(): RootedComponent<any> {
    const tagPalette = new TagPaletteView().width('100%');
    const groupPalette = new GroupPaletteView().width('100%');
    const searchBox = textInput()
        .width('100%')
        .marginVertical('4px')
        .marginRight('8px')
        .onkeyup((ev: KeyboardEvent) => {
            this.tagPalette.setSearch(this.searchBox?.value);
            this.groupPalette.setSearch(this.searchBox?.value);
        })

    return div().withChildren([
        searchBox,
        tagPalette,
        groupPalette,
    ])
}
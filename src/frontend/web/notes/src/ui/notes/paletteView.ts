import {View} from "../../utility/view";
import {Observable, Subscription} from "rxjs";
import {
    AnyBuilder,
    clear,
    DivBuilder,
    InputBuilder,
    input,
    inlineFlexColumn
} from "../../utility/element";
import {tagLabel} from "../component/tagLabel";
import {startDraggingTag, stopDragging} from "../../service/dragDropService";
import Fuse from "fuse.js";
import {Tag} from "../../service/tagService";
import {Services} from "../../service/services";
import {TagPaletteView} from "./tagPaletteView";
import {GroupPaletteView} from "./groupPaletteView";

const tagSearchOptions = {
    keys: ['name']
}

export class PaletteView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private searchBox: InputBuilder;

    private tagPalette: TagPaletteView;
    private groupPalette: GroupPaletteView;

    setup(): void {
        this.searchBox = input()
            .in(this.container)
            .width('100%')
            .marginVertical('4px')
            .marginRight('8px')
            .onkeyup((ev: KeyboardEvent) => {
                this.tagPalette.setSearch(this.searchBox?.element()?.value);
                this.groupPalette.setSearch(this.searchBox?.element()?.value);
            })

        const tagPaletteContainer = inlineFlexColumn()
            .in(this.container)
            .width('100%');
        this.tagPalette = new TagPaletteView(tagPaletteContainer, this.s);
        this.tagPalette.setup();

        const groupPaletteContainer = inlineFlexColumn()
            .in(this.container)
            .width('100%');
        this.groupPalette = new GroupPaletteView(groupPaletteContainer, this.s);
        this.groupPalette.setup();
    }

    public teardown(): void {}
}
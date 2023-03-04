import {View} from "../../utility/view";
import {AnyBuilder, div} from "../../utility/element";
import {TagPaletteView} from "../notes/tagPaletteView";
import {DocumentFilterService} from "../../service/documentFilterService";
import {TagService} from "../../service/tagService";


export class SidebarView implements View {
    private palette: TagPaletteView;

    constructor(
        private container: AnyBuilder,
        private documentFilters: DocumentFilterService,
        private tags: TagService,
    ) {}

    public setup(): void {
        const subContainer = div()
            .in(this.container)
            .background('lightgray')
            .width('200px')

        div('Tags')
            .in(subContainer)
            .textAlign('center')

        this.palette = new TagPaletteView(subContainer, this.documentFilters, this.tags);

        this.palette.setup();
    }

    public teardown(): void {
        this.palette?.teardown();
    }


}
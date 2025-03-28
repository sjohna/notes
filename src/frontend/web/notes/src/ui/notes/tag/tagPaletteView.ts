import {Observable, Subscription} from "rxjs";
import {tagLabel} from "./tagLabel";
import {startDraggingTag, stopDragging} from "../../../service/dragDropService";
import Fuse from "fuse.js";
import {Tag} from "../../../service/tagService";
import {services} from "../../../service/services";
import {
    CompositeComponentBase,
    div,
    Div,
    inlineFlexColumn,
} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {APIData} from "../../../service/apiData";

const tagSearchOptions = {
    keys: ['name']
}

export class TagPaletteView extends CompositeComponentBase {
    private tagListContainer: Div;

    private tagFuse: Fuse<Tag>;
    private unfilteredTags: Tag[];

    private search?: string;

    constructor() {
        super(div());
        this.display('inline-flex')
            .flexDirection('column');

        this.tagListContainer = inlineFlexColumn()
            .in(this.root)
            .height('100%');

        this.onTeardown(unsubscribe(services.tagService.tags$.subscribe((tags) => this.tagsUpdated(tags))))
    }

    public setSearch(search: string) {
        this.search = search;
        if (this.tagFuse && this.search) {
            const filteredTags = this.tagFuse.search(this.search).map((r) => r.item)
            this.renderTags(filteredTags)
        } else {
            this.renderTags(this.unfilteredTags);
        }
    }

    private tagsUpdated(tags: APIData<Tag[]>) {
        // TODO: in progress and error

        this.unfilteredTags = tags.data;
        this.tagFuse = new Fuse(tags.data, tagSearchOptions);
        if (this.tagFuse && this.search) {
            const filteredTags = this.tagFuse.search(this.search).map((r) => r.item)
            this.renderTags(filteredTags)
        } else {
            this.renderTags(this.unfilteredTags);
        }
    }

    private renderTags(tags: Tag[]) {
        this.tagListContainer.clear();

        div('Tags')
            .in(this.tagListContainer)
            .textAlign('center')

        for (const tag of tags) {
            const localTag = tag
            const currentTagLabel = tagLabel(tag.name)
                .in(this.tagListContainer)
                .width('fit-content')
                .margin('4px')
                .cursor('pointer')
                .ondragstart(() => this.dragStart(tag))
                .ondragend(() => this.dragEnd(tag))
                .onclick(() => {
                    if (services.documentFilterService.filter.tags.find((t) => t.tag === localTag.id)) {
                        services.documentFilterService.filter.tags = services.documentFilterService.filter.tags.filter((t) => t.tag !== localTag.id);
                        services.documentFilterService.update();
                        currentTagLabel.background('white');
                    } else {
                        services.documentFilterService.filter.tags.push({tag: localTag.id, exclude: false})
                        services.documentFilterService.update();
                        currentTagLabel.background('cyan');
                    }
                })

        }
    }

    private dragStart(tag: Tag) {
        startDraggingTag(tag)
    }

    private dragEnd(tag: Tag) {
        stopDragging()
    }
}
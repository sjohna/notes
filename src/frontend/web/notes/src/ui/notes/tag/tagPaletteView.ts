import {Observable, Subscription} from "rxjs";
import {tagLabel} from "../../component/tagLabel";
import {startDraggingTag, stopDragging} from "../../../service/dragDropService";
import Fuse from "fuse.js";
import {Tag} from "../../../service/tagService";
import {Services} from "../../../service/services";
import {ComponentBase, div, Div, ElementComponent, inlineFlexColumn} from "../../../utility/component";

const tagSearchOptions = {
    keys: ['name']
}

export class TagPaletteView extends ElementComponent<HTMLDivElement> {
    private tags$: Observable<Tag[]>;
    private tagListContainer: Div;
    private tagSubscription?: Subscription;
    private tagFuse: Fuse<Tag>;
    private unfilteredTags: Tag[];

    private search?: string;

    constructor(
        private s: Services,
    ) {
        super(document.createElement('div'));
        this.display('inline-flex')
            .flexDirection('column');

        this.tags$ = this.s.tagService.tags$;

        this.tagSubscription?.unsubscribe();
        this.tagListContainer = inlineFlexColumn()
            .in(this)   // TODO: I hate this...
            .height('100%');

        this.tagSubscription = this.tags$.subscribe((tags) => this.tagsUpdated(tags))
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

    private tagsUpdated(tags: Tag[]) {
        this.unfilteredTags = tags;
        this.tagFuse = new Fuse(tags, tagSearchOptions);
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
                    if (this.s.documentFilterService.filter.tags.find((t) => t.tag === localTag.id)) {
                        this.s.documentFilterService.filter.tags = this.s.documentFilterService.filter.tags.filter((t) => t.tag !== localTag.id);
                        this.s.documentFilterService.update();
                        currentTagLabel.background('white');
                    } else {
                        this.s.documentFilterService.filter.tags.push({tag: localTag.id, exclude: false})
                        this.s.documentFilterService.update();
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

    public teardown(): void {
        super.teardown();

        // TODO: maybe a better way to handle stuff like this
        this.tagSubscription?.unsubscribe();
    }
}
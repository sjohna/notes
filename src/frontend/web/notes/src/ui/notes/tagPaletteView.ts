import {View} from "../../utility/view";
import {Subscription} from "rxjs";
import {createTag, fetchTags, Tag, tags$} from "../../service/tags";
import {
    AnyBuilder,
    clear,
    DivBuilder,
    InputBuilder,
    button,
    div,
    input,
    flexRow,
    flexColumn, inlineFlexColumn
} from "../../utility/element";
import {LabeledTextInput} from "../component/labeledTextInput";
import {tagLabel} from "../component/tagLabel";
import {startDragging, stopDragging} from "../../service/dragDropService";
import Fuse from "fuse.js";
import {documentFilters, quickNoteDataHandle} from "../../service/quickNotes";

const tagSearchOptions = {
    keys: ['name']
}

export class TagPaletteView implements View {
    constructor(private container: AnyBuilder) {}

    private tagListContainer: DivBuilder;

    private tagSubscription?: Subscription;

    private tagFuse: Fuse<Tag>;

    private tagSearchBox: InputBuilder;

    private unfilteredTags: Tag[];

    setup(): void {
        this.tagSearchBox = input() // TODO: fix right margin on this
            .in(this.container)
            .width('100%')
            .marginVertical('4px')
            .onkeyup((ev: KeyboardEvent) => {
                if (this.tagFuse && this.tagSearchBox?.element()?.value) {
                    const filteredTags = this.tagFuse.search(this.tagSearchBox.element().value).map((r) => r.item)
                    this.renderTags(filteredTags)
                } else {
                    this.renderTags(this.unfilteredTags);
                }
            })

        this.tagSubscription?.unsubscribe();
        this.tagListContainer = inlineFlexColumn()
            .in(this.container)
            .height('100%');

        this.tagSubscription = tags$.subscribe((tags) => this.tagsUpdated(tags))
    }

    private tagsUpdated(tags: Tag[]) {
        this.unfilteredTags = tags;
        this.tagFuse = new Fuse(tags, tagSearchOptions);
        if (this.tagFuse && this.tagSearchBox?.element()?.value) {
            const filteredTags = this.tagFuse.search(this.tagSearchBox.element().value).map((r) => r.item)
            this.renderTags(filteredTags)
        } else {
            this.renderTags(this.unfilteredTags);
        }
    }

    private renderTags(tags: Tag[]) {
        clear(this.tagListContainer);
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
                    if (documentFilters.filter.tags.find((t) => t.tag === localTag.id)) {
                        documentFilters.filter.tags = documentFilters.filter.tags.filter((t) => t.tag !== localTag.id);
                        documentFilters.update();
                        currentTagLabel.background('white');
                    } else {
                        documentFilters.filter.tags.push({tag: localTag.id, exclude: false})
                        documentFilters.update();
                        currentTagLabel.background('cyan');
                    }
                })

        }
    }

    private dragStart(tag: Tag) {
        startDragging(tag)
        console.log(`Drag start from ${tag.name}`)
    }

    private dragEnd(tag: Tag) {
        stopDragging()
        console.log(`Drag end from ${tag.name}`)
    }

    public teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
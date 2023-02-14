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

export class TagPaletteView implements View {
    constructor(private container: AnyBuilder) {}

    private tagListContainer: DivBuilder;

    private tagSubscription?: Subscription;

    setup(): void {
        this.tagSubscription?.unsubscribe();
        this.tagListContainer = inlineFlexColumn()
            .in(this.container)
            .height('100%');

        this.tagSubscription = tags$.subscribe((tags) => this.renderTags(tags))
    }

    private renderTags(tags: Tag[]) {
        clear(this.tagListContainer);
        for (const tag of tags) {
            tagLabel(tag.name)
                .in(this.tagListContainer)
                .width('fit-content')
                .margin('4px')
                .ondragstart(() => this.dragStart(tag))
                .ondragend(() => this.dragEnd(tag))

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
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
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
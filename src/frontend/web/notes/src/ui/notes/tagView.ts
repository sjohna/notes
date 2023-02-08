import {View} from "../../utility/view";
import {Subscription} from "rxjs";
import {createTag, fetchTags, Tag, tags$} from "../../service/tags";
import {AnyBuilder, clear, DivBuilder, InputBuilder, button, div, input, flexRow} from "../../utility/element";
import {LabeledTextInput} from "../component/labeledTextInput";

export class TagView implements View {
    constructor(private container: AnyBuilder) {}

    private tagListContainer: DivBuilder;

    private tagSubscription?: Subscription;

    private tagName: LabeledTextInput;
    private tagDescription: LabeledTextInput;
    private tagColor: LabeledTextInput;

    setup(): void {
        this.tagSubscription?.unsubscribe();

        this.render();
        this.tagSubscription = tags$.subscribe((tags) => this.renderTags(tags))
        fetchTags();
    }

    private render() {
        clear(this.container);

        this.tagName = new LabeledTextInput('Name:')
        this.tagDescription = new LabeledTextInput('Description:')
        this.tagColor = new LabeledTextInput('Color:')

        div()
            .in(this.container)
            .withChildren([
                this.tagName.container,
                this.tagDescription.container,
                this.tagColor.container,
                button('Create Tag')
                    .onclick(() => this.createTag())
            ]);

        this.tagListContainer = div()
            .in(this.container);
    }

    private createTag() {
        createTag(this.tagName.value, this.tagColor.value, this.tagDescription.value ?? undefined);
    }

    private renderTags(tags: Tag[]) {
        clear(this.tagListContainer);
        for (const tag of tags) {
            flexRow()
                .in(this.tagListContainer)
                .margin('8px')
                .padding('8px')
                .withChildren([
                    div()
                        .width('16px')
                        .height('16px')
                        .borderRadius('8px')
                        .marginHorizontal('4px')
                        .background('#' + tag.color),
                    div(`${tag.name}${tag.description ? ' - ' + tag.description : ''}`)
                        .marginHorizontal('4px'),
                    ]
                )
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
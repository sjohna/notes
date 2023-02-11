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

        div()
            .in(this.container)
            .withChildren([
                this.tagName.container,
                this.tagDescription.container,
                button('Create Tag')
                    .onclick(() => this.createTag())
            ]);

        this.tagListContainer = div()
            .in(this.container);
    }

    private createTag() {
        createTag(this.tagName.value, this.tagDescription.value ?? undefined);
    }

    private renderTags(tags: Tag[]) {
        clear(this.tagListContainer);
        for (const tag of tags) {
            div(`${tag.name}${tag.description ? ' - ' + tag.description : ''}`)
                .in(this.tagListContainer)
                .marginHorizontal('4px')
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
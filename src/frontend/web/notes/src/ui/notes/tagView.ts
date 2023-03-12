import {View} from "../../utility/view";
import {Subscription} from "rxjs";
import {AnyBuilder, clear, DivBuilder, button, div} from "../../utility/element";
import {LabeledTextInput} from "../component/labeledTextInput";
import {Tag} from "../../service/tagService";
import {Services} from "../../service/services";

export class TagView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private tagListContainer: DivBuilder;

    private tagSubscription?: Subscription;

    private tagName: LabeledTextInput;
    private tagDescription: LabeledTextInput;

    setup(): void {
        this.tagSubscription?.unsubscribe();

        this.render();
        this.tagSubscription = this.s.tagService.tags$.subscribe((tags) => this.renderTags(tags))
        this.s.tagService.get();
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
        this.s.tagService.createTag(this.tagName.value, this.tagDescription.value ?? undefined);
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
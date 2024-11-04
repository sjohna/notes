import {Subscription} from "rxjs";
import {LabeledTextInput} from "../../component/labeledTextInput";
import {Tag} from "../../../service/tagService";
import {Services} from "../../../service/services";
import {TagView} from "./tagView";
import {button, ComponentBase, div, Div} from "../../../utility/component";

export class TagListView extends ComponentBase {
    private container: Div = div();

    private tagListContainer: Div;

    private tagSubscription?: Subscription;

    private tagName: LabeledTextInput;
    private tagDescription: LabeledTextInput;

    constructor(
        private s: Services,
    ) {
        super();

        this.tagSubscription?.unsubscribe();

        this.render();
        this.tagSubscription = this.s.tagService.tags$.subscribe((tags) => this.renderTags(tags))
        this.s.tagService.get();
    }

    public root(): HTMLElement {
        return this.container.root();
    }

    private render() {
        this.container.clear();

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
        this.tagListContainer.clear();

        for (const tag of tags) {
            this.tagListContainer.withChild(new TagView(tag, this.s));
        }
    }

    teardown(): void {
        super.teardown();

        // TODO: make sure this actually works and removes all teh subscriptions I want it to
        this.tagListContainer.teardown();

        // TODO: refactor components so that there's a root (ElementComponent) and a rootElement (HTMLElement), and have teardown on the component teardown the root

        this.tagSubscription?.unsubscribe();
    }
}
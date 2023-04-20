import {SubViewCollection, View} from "../../utility/view";
import {Subscription} from "rxjs";
import {AnyBuilder, clear, DivBuilder, button, div} from "../../utility/element";
import {LabeledTextInput} from "../component/labeledTextInput";
import {Tag} from "../../service/tagService";
import {Services} from "../../service/services";
import {TagView} from "./tagView";

export class TagListView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private tagListContainer: DivBuilder;

    private tagSubscription?: Subscription;

    private tagName: LabeledTextInput;
    private tagDescription: LabeledTextInput;

    private tagViews: SubViewCollection;

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
        this.tagViews?.teardown();
        this.tagViews = new SubViewCollection();

        for (const tag of tags) {
            const tagContainer = div().in(this.tagListContainer);
            this.tagViews.setupAndAdd(new TagView(tagContainer, tag, this.s));
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
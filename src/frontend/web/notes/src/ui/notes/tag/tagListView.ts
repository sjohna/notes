import {Tag} from "../../../service/tagService";
import {Services} from "../../../service/services";
import {tagView} from "./tagView";
import {button, CompositeComponentBase, div, Div, ValueComponent} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {labelledTextBox} from "../../component/labeledTextInput";

export class TagListView extends CompositeComponentBase {
    private tagListContainer: Div;

    private tagName: ValueComponent<string>;
    private tagDescription: ValueComponent<string>;

    constructor(
        private s: Services,
    ) {
        super(div());

        this.render();
        this.onTeardown(unsubscribe(this.s.tagService.tags$.subscribe((tags) => this.renderTags(tags))));
        this.s.tagService.get();
    }

    private render() {
        this.root.clear();

        this.tagName = labelledTextBox('Name:')
        this.tagDescription = labelledTextBox('Description:')

        div()
            .in(this.root)
            .withChildren([
                this.tagName,
                this.tagDescription,
                button('Create Tag')
                    .onclick(() => this.createTag())
            ]);

        this.tagListContainer = div()
            .in(this.root);
    }

    private createTag() {
        this.s.tagService.createTag(this.tagName.getValue(), this.tagDescription.getValue() ?? undefined);
    }

    private renderTags(tags: Tag[]) {
        this.tagListContainer.clear();

        for (const tag of tags) {
            this.tagListContainer.withChild(tagView(tag));
        }
    }
}
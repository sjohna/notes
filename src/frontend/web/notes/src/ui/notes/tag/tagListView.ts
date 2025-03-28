import {Tag} from "../../../service/tagService";
import {tagView} from "./tagView";
import {button, CompositeComponentBase, div, Div, ValueComponent} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {labelledTextBox} from "../../component/labeledTextInput";
import {services} from "../../../service/services";
import {APIData} from "../../../service/apiData";

export class TagListView extends CompositeComponentBase {
    private tagListContainer: Div;

    private tagName: ValueComponent<string>;
    private tagDescription: ValueComponent<string>;

    constructor() {
        super(div());

        this.render();
        this.onTeardown(unsubscribe(services.tagService.tags$.subscribe((tags) => this.renderTags(tags))));
        services.tagService.get();
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
        services.tagService.createTag(this.tagName.getValue(), this.tagDescription.getValue() ?? undefined);
    }

    private renderTags(tags: APIData<Tag[]>) {
        this.tagListContainer.clear();

        // TODO: in progress and error

        for (const tag of tags.data) {
            this.tagListContainer.withChild(tagView(tag));
        }
    }
}
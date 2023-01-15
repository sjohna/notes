import {View} from "../utility/view";
import {Subscription} from "rxjs";
import {createTag, fetchTags, Tag, tags$} from "../service/tags";
import {AnyBuilder, clear, DivBuilder, InputBuilder, button, div, input, flexRow} from "../utility/element";

export class TagView implements View {
    constructor(private container: AnyBuilder) {}

    private tagListContainer: DivBuilder;

    private tagSubscription?: Subscription;

    private tagNameElement: InputBuilder;
    private tagDescriptionElement: InputBuilder;
    private tagColorElement: InputBuilder;

    setup(): void {
        this.tagSubscription?.unsubscribe();

        this.render();
        this.tagSubscription = tags$.subscribe((tags) => this.renderTags(tags))
        fetchTags();
    }

    private render() {
        clear(this.container);

        this.tagNameElement = input()
            .width('100%');
        this.tagDescriptionElement = input()
            .width('100%');
        this.tagColorElement = input()
            .width('100%');

        div()
            .in(this.container)
            .withChildren([
                flexRow()
                    .width('400px')
                    .withChildren([
                        div('Name:')
                            .width('100px'),
                        this.tagNameElement
                    ]),
                flexRow()
                    .width('400px')
                    .withChildren([
                        div('Description:')
                            .width('100px'),
                        this.tagDescriptionElement,
                    ]),
                flexRow()
                    .width('400px')
                    .withChildren([
                        div('Color:')
                            .width('100px'),
                        this.tagColorElement
                    ]),
                button('Create Tag')
                    .onclick(() => this.createTag())
            ]);

        this.tagListContainer = div()
            .in(this.container);
    }

    private createTag() {
        createTag(this.tagNameElement.element().value, this.tagColorElement.element().value, this.tagDescriptionElement.element().value ?? undefined);
    }

    private renderTags(tags: Tag[]) {
        clear(this.tagListContainer);
        for (const tag of tags) {
            flexRow()
                .margin('8px')
                .padding('8px')
                .withChild(
                    div()
                        .width('16px')
                        .height('16px')
                        .borderRadius('8px')
                        .marginHorizontal('4px')
                        .background('#' + tag.color)
                )
                .withChild(
                    div(`${tag.name}${tag.description ? ' - ' + tag.description : ''}`)
                        .marginHorizontal('4px')
                )
                .in(this.tagListContainer)
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
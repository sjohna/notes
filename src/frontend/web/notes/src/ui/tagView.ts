import {View} from "../utility/view";
import {Subscription} from "rxjs";
import {createTag, fetchTags, Tag, tags$} from "../service/tags";
import {clear, newButton, newDiv, newInput} from "../utility/element";

export class TagView implements View {
    constructor(private container: HTMLElement) {}

    private tagListContainer: HTMLDivElement;

    private tagSubscription?: Subscription;

    private tagNameElement: HTMLInputElement;
    private tagDescriptionElement: HTMLInputElement;
    private tagColorElement: HTMLInputElement;

    setup(): void {
        this.tagSubscription?.unsubscribe();

        this.render();
        this.tagSubscription = tags$.subscribe((tags) => this.renderTags(tags))
        fetchTags();
    }

    private render() {
        clear(this.container);

        this.tagNameElement = newInput()
            .width('100%')
            .element();
        this.tagDescriptionElement = newInput()
            .width('100%')
            .element();
        this.tagColorElement = newInput()
            .width('100%')
            .element();

        newDiv()
            .withChild(
                newDiv()
                    .display('flex')
                    .flexDirection('row')
                    .width('400px')
                    .withChild(newDiv()
                        .width('100px')
                        .innerText('Name:')
                        .element()
                    )
                    .withChild(this.tagNameElement)
                    .element()
            )
            .withChild(
                newDiv()
                    .display('flex')
                    .flexDirection('row')
                    .width('400px')
                    .withChild(newDiv()
                        .width('100px')
                        .innerText('Description:')
                        .element()
                    )
                    .withChild(this.tagDescriptionElement)
                    .element()
            )
            .withChild(
                newDiv()
                    .display('flex')
                    .flexDirection('row')
                    .width('400px')
                    .withChild(newDiv()
                        .width('100px')
                        .innerText('Color:')
                        .element()
                    )
                    .withChild(this.tagColorElement)
                    .element()
            )
            .withChild(
                newButton()
                    .innerText('Create Tag')
                    .onclick(() => this.createTag())
                    .element()
            )
            .in(this.container);

        this.tagListContainer = newDiv()
            .in(this.container)
            .element();
    }

    private createTag() {
        createTag(this.tagNameElement.value, this.tagColorElement.value, this.tagDescriptionElement.value ?? undefined);
    }

    private renderTags(tags: Tag[]) {
        clear(this.tagListContainer);
        for (const tag of tags) {
            newDiv()
                .margin('8px')
                .padding('8px')
                .display('flex')
                .flexDirection('row')
                .withChild(
                    newDiv()
                        .width('16px')
                        .height('16px')
                        .borderRadius('8px')
                        .marginHorizontal('4px')
                        .background('#' + tag.color)
                        .element()
                )
                .withChild(
                    newDiv()
                        .marginHorizontal('4px')
                        .innerText(`${tag.name}${tag.description ? ' - ' + tag.description : ''}`)
                        .element()
                )
                .in(this.tagListContainer)
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
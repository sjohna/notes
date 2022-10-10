import {View} from "../utility/view";
import {Subscription} from "rxjs";
import {fetchTags, Tag, tags$} from "../service/tags";
import {clear, newDiv} from "../utility/element";

export class TagView implements View {
    constructor(private container: HTMLElement) {}

    private tagSubscription?: Subscription;

    setup(): void {
        this.tagSubscription?.unsubscribe();
        this.tagSubscription = tags$.subscribe((tags) => this.renderTags(tags))
        fetchTags();
    }

    private renderTags(tags: Tag[]) {
        clear(this.container);
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
                .in(this.container)
        }
    }

    teardown(): void {
        this.tagSubscription?.unsubscribe();
    }
}
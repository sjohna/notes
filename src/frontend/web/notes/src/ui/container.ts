import {View} from "../utility/view";
import {newCheckbox, newDiv} from "../utility/element";
import {TagView} from "./tagView";
import {QuickNoteView} from "./quickNoteView";


export class ContainerView implements View {
    constructor(private container: HTMLElement) {}

    private viewTagsCheckbox?: HTMLInputElement;

    private mainContainer?: HTMLDivElement;

    private view: View;

    setup(): void {
        const banner = newDiv()
            .display('flex')
            .flexDirection('row')
            .in(this.container)
            .element();

        this.mainContainer = newDiv()
            .in(this.container)
            .element();

        this.viewTagsCheckbox = newCheckbox()
            .onchange((ev) => this.renderView())
            .in(banner)
            .element();

        newDiv()
            .innerText('View Tags?')
            .in(banner);

        this.renderView();
    }

    private renderView() {
        this.view?.teardown();
        if (this.viewTagsCheckbox.checked) {
            this.view = new TagView(this.mainContainer);
        } else {
            this.view = new QuickNoteView(this.mainContainer);
        }
        this.view?.setup();
    }

    teardown(): void {
    }

}
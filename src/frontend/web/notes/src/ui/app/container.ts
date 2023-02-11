import {View} from "../../utility/view";
import {AnyBuilder, clear, DivBuilder, checkbox, div, flexRow} from "../../utility/element";
import {TagView} from "../notes/tagView";
import {QuickNoteView} from "../notes/quickNoteView";
import {Tabs} from "../component/tabs";


export class ContainerView implements View {
    constructor(private container: AnyBuilder) {}

    private tabBar: Tabs;

    private mainContainer?: DivBuilder;

    private view: View;

    setup(): void {
        this.tabBar = new Tabs()
            .in(this.container)
            .withTab('notes', 'Notes', true)
            .withTab('tags', 'Tags')
            .selectionChange(() => this.renderView())

        this.mainContainer = div().in(this.container);

        this.tabBar.renderTabs();
        this.renderView();
    }

    private renderView() {
        this.view?.teardown();
        if (this.tabBar.selectedTab === 'tags') {
            this.view = new TagView(this.mainContainer);
        } else {
            this.view = new QuickNoteView(this.mainContainer);
        }
        this.view?.setup();
    }

    teardown(): void {
    }

}
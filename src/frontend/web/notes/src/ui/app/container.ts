import {View} from "../../utility/view";
import {AnyBuilder, clear, DivBuilder, checkbox, div, flexRow} from "../../utility/element";
import {TagView} from "../notes/tagView";
import {QuickNoteView} from "../notes/quickNoteView";
import {Tabs} from "../component/tabs";
import {TagPaletteView} from "../notes/tagPaletteView";


export class ContainerView implements View {
    constructor(private container: AnyBuilder) {}

    private tabBar: Tabs;

    private topLevelContainer?: DivBuilder;
    private sideContainer?: DivBuilder;
    private mainContainer?: DivBuilder;
    private mainViewContainer?: DivBuilder;

    private sideView: View;

    private view: View;

    setup(): void {
        this.topLevelContainer = flexRow()
            .in(this.container)
            .height('100%');

        this.sideContainer = div()
            .in(this.topLevelContainer)
            .height('100%')
            .background('lightgray')
            .marginRight('8px')

        this.sideView = new TagPaletteView(this.sideContainer);

        this.mainContainer = div()
            .in(this.topLevelContainer)
            .height('100%');

        this.tabBar = new Tabs()
            .in(this.mainContainer)
            .withTab('notes', 'Notes', true)
            .withTab('tags', 'Tags')
            .selectionChange(() => this.renderMainView())

        this.mainViewContainer = div()
            .in(this.mainContainer)
            .height('100%')
            .overflow('auto');

        this.tabBar.renderTabs();
        this.sideView.setup();
        this.renderMainView();
    }

    private renderMainView() {
        this.view?.teardown();
        if (this.tabBar.selectedTab === 'tags') {
            this.view = new TagView(this.mainViewContainer);
        } else {
            this.view = new QuickNoteView(this.mainViewContainer);
        }
        this.view?.setup();
    }

    teardown(): void {
    }

}
import {View} from "../../utility/view";
import {AnyBuilder, DivBuilder, div, flexRow} from "../../utility/element";
import {TagView} from "../notes/tagView";
import {QuickNoteView} from "../notes/quickNoteView";
import {Tabs} from "../component/tabs";
import {SidebarView} from "./sidebar";
import {Services} from "../../service/services";


export class ContainerView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private tabBar: Tabs;

    private topLevelContainer?: DivBuilder;
    private sideContainer?: DivBuilder;
    private mainContainer?: DivBuilder;
    private mainViewContainer?: DivBuilder;

    private sideView: View;

    private mainView: View;

    setup(): void {
        this.topLevelContainer = flexRow()
            .in(this.container)
            .height('100%');

        this.sideContainer = div()
            .in(this.topLevelContainer)
            .height('100%')
            .marginRight('8px')

        this.sideView = new SidebarView(this.sideContainer, this.s);

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
        this.mainView?.teardown();
        if (this.tabBar.selectedTab === 'tags') {
            this.mainView = new TagView(this.mainViewContainer, this.s);
        } else {
            this.mainView = new QuickNoteView(this.mainViewContainer, this.s);
        }
        this.mainView?.setup();
    }

    teardown(): void {
    }

}
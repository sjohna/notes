import {View} from "../../utility/view";
import {AnyBuilder, DivBuilder, div, flexRow, flexColumn} from "../../utility/element";
import {TagListView} from "../notes/tagListView";
import {QuickNoteView} from "../notes/quickNoteView";
import {Tabs} from "../component/tabs";
import {SidebarView} from "./sidebar";
import {Services} from "../../service/services";
import {DocumentGroupListView} from "../notes/documentGroupListView";


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

        this.mainContainer = flexColumn()
            .in(this.topLevelContainer)
            .height('100%');

        this.tabBar = new Tabs()
            .in(this.mainContainer)
            .withTab('notes', 'Notes', true)
            .withTab('tags', 'Tags')
            .withTab('documentGroups', 'Groups')
            .selectionChange(() => this.renderMainView())

        this.mainViewContainer = flexColumn()
            .in(this.mainContainer)
            .height('100%')
            .overflow('hidden')
            .paddingBottom('8px');

        this.tabBar.renderTabs();
        this.sideView.setup();
        this.renderMainView();
    }

    private renderMainView() {
        this.mainView?.teardown();
        if (this.tabBar.selectedTab === 'tags') {
            this.mainView = new TagListView(this.mainViewContainer, this.s);
        } else if (this.tabBar.selectedTab === 'documentGroups') {
            this.mainView = new DocumentGroupListView(this.mainViewContainer, this.s);
        } else {
            this.mainView = new QuickNoteView(this.mainViewContainer, this.s);
        }
        this.mainView?.setup();
    }

    teardown(): void {
    }

}
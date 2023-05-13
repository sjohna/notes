import {View} from "../../utility/view";
import {AnyBuilder, DivBuilder, div, flexRow, flexColumn} from "../../utility/element";
import {TagListView} from "../notes/tagListView";
import {NoteView} from "../notes/note/noteView";
import {Tab, Tabs} from "../component/tabs";
import {SidebarView} from "./sidebar";
import {Services} from "../../service/services";
import {DocumentGroupListView} from "../notes/documentGroupListView";
import {navigate, navigationEvents$} from "../../service/navigationService";


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
            .withTab('notes', 'Notes', '/notes')
            .withTab('tags', 'Tags', '/tags')
            .withTab('documentGroups', 'Groups', '/groups')
            .selectionChange((t: Tab) => {
                navigate(t.metaData, t.tabName);
            })

        this.mainViewContainer = flexColumn()
            .in(this.mainContainer)
            .height('100%')
            .overflow('hidden')
            .paddingBottom('8px');

        navigationEvents$.subscribe((e) => {
            this.renderMainView();
        });

        this.tabBar.renderTabs();
        this.sideView.setup();

        navigationEvents$.subscribe((e) => {
            this.tabBar.selectTab(e.mainViewTab);
            this.renderMainView();
        });
    }

    private renderMainView() {
        this.mainView?.teardown();
        if (this.tabBar.selectedTab === 'tags') {
            this.mainView = new TagListView(this.mainViewContainer, this.s);
        } else if (this.tabBar.selectedTab === 'documentGroups') {
            this.mainView = new DocumentGroupListView(this.mainViewContainer, this.s);
        } else if (this.tabBar.selectedTab === 'notes') {
            this.mainView = new NoteView(this.mainViewContainer, this.s);
        }
        this.mainView?.setup();
    }

    teardown(): void {
    }

}
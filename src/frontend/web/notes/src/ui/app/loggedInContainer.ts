import {TagListView} from "../notes/tag/tagListView";
import {NoteView} from "../notes/note/noteView";
import {Tab, Tabs} from "../component/tabs";
import {SidebarView} from "./sidebar";
import {Services} from "../../service/services";
import {GroupListView} from "../notes/group/groupListView";
import {NavigateEvent} from "../../service/navigationService";
import {CompositeComponentBase, div, Div, flexColumn, flexRow} from "../../utility/component";
import {unsubscribe} from "../../utility/subscription";

export class LoggedInContainerView extends CompositeComponentBase {
    private tabBar: Tabs;

    private topLevelContainer?: Div;
    private sideContainer?: Div;
    private mainContainer?: Div;
    private mainViewContainer?: Div;

    constructor(
        private s: Services,
    ) {
        super(div());

        this.topLevelContainer = flexRow()
            .in(this.root)
            .height('100%');

        this.sideContainer = div()
            .in(this.topLevelContainer)
            .height('100%')
            .marginRight('8px')

        new SidebarView(this.s).in(this.sideContainer);

        this.mainContainer = flexColumn()
            .in(this.topLevelContainer)
            .height('100%');

        this.tabBar = new Tabs()
            .in(this.mainContainer)
            .withTab('notes', 'Notes', '/notes')
            .withTab('tags', 'Tags', '/tags')
            .withTab('groups', 'Groups', '/groups')
            .selectionChange((t: Tab) => {
                this.s.navService.navigate(t.metaData, t.tabName);
            })

        this.mainViewContainer = flexColumn()
            .in(this.mainContainer)
            .height('100%')
            .overflow('hidden')
            .paddingBottom('8px');

        this.tabBar.renderTabs();

        this.onTeardown(unsubscribe(this.s.navService.navigationEvents$.subscribe((e) => {
            if (e.loggedIn) {
                this.tabBar.selectTab(e.mainViewTab);
            }
            this.renderMainView();
        })));
    }

    private renderMainView() {
        this.mainViewContainer.clear();
        if (this.tabBar.selectedTab === 'tags') {
            new TagListView(this.s).in(this.mainViewContainer);
        } else if (this.tabBar.selectedTab === 'groups') {
            new GroupListView(this.s).in(this.mainViewContainer);
        } else if (this.tabBar.selectedTab === 'notes') {
            new NoteView(this.s).in(this.mainViewContainer);
        }
    }
}
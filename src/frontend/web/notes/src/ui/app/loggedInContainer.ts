import {TagListView} from "../notes/tag/tagListView";
import {NoteView} from "../notes/note/noteView";
import {Tab, Tabs} from "../component/tabs";
import {services} from "../../service/services";
import {GroupListView} from "../notes/group/groupListView";
import {CompositeComponentBase, div, Div, flexColumn, flexRow} from "../../utility/component";
import {unsubscribe} from "../../utility/subscription";
import {sidebar} from "./sidebar";

export class LoggedInContainerView extends CompositeComponentBase {
    private tabBar: Tabs;

    private topLevelContainer?: Div;
    private sideContainer?: Div;
    private mainContainer?: Div;
    private mainViewContainer?: Div;

    constructor() {
        super(div());

        this.topLevelContainer = flexRow()
            .in(this.root)
            .height('100%');

        this.sideContainer = div()
            .in(this.topLevelContainer)
            .height('100%')
            .marginRight('8px')

        sidebar().in(this.sideContainer);

        this.mainContainer = flexColumn()
            .in(this.topLevelContainer)
            .height('100%');

        this.tabBar = new Tabs()
            .in(this.mainContainer)
            .withTab('notes', 'Notes', '/notes')
            .withTab('tags', 'Tags', '/tags')
            .withTab('groups', 'Groups', '/groups')
            .selectionChange((t: Tab) => {
                services.navService.navigate(t.metaData, t.tabName);
            })

        this.mainViewContainer = flexColumn()
            .in(this.mainContainer)
            .height('100%')
            .overflow('hidden')
            .paddingBottom('8px');

        this.tabBar.renderTabs();

        this.onTeardown(unsubscribe(services.navService.navigationEvents$.subscribe((e) => {
            if (e.loggedIn) {
                this.tabBar.selectTab(e.mainViewTab);
            }
            this.renderMainView();
        })));
    }

    private renderMainView() {
        this.mainViewContainer.clear();
        if (this.tabBar.selectedTab === 'tags') {
            new TagListView().in(this.mainViewContainer);
        } else if (this.tabBar.selectedTab === 'groups') {
            new GroupListView().in(this.mainViewContainer);
        } else if (this.tabBar.selectedTab === 'notes') {
            new NoteView().in(this.mainViewContainer);
        }
    }
}
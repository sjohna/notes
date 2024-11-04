import {TagListView} from "../notes/tag/tagListView";
import {NoteView} from "../notes/note/noteView";
import {Tab, Tabs} from "../component/tabs";
import {SidebarView} from "./sidebar";
import {Services} from "../../service/services";
import {GroupListView} from "../notes/group/groupListView";
import {NavigateEvent} from "../../service/navigationService";
import {Subscription} from "rxjs";
import {Component, ComponentBase, div, Div, flexColumn, flexRow} from "../../utility/component";

export class LoggedInContainerView extends ComponentBase {
    private container: Div = div();

    private tabBar: Tabs;

    private topLevelContainer?: Div;
    private sideContainer?: Div;
    private mainContainer?: Div;
    private mainViewContainer?: Div;

    private sideView: Component;

    private mainView: Component;

    private navigationSubscription?: Subscription;

    constructor(
        private s: Services,
    ) {
        super();

        this.topLevelContainer = flexRow()
            .in(this.container)
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

        this.s.navService.navigationEvents$.subscribe((e: NavigateEvent) => {
            if (e.loggedIn) {
                this.renderMainView();
            }
        });

        this.tabBar.renderTabs();

        this.navigationSubscription = this.s.navService.navigationEvents$.subscribe((e) => {
            if (e.loggedIn) {
                this.tabBar.selectTab(e.mainViewTab);
                this.renderMainView();
            }
        });
    }

    root(): HTMLElement {
        return this.container.root();
    }

    private renderMainView() {
        this.mainViewContainer.clear();
        if (this.tabBar.selectedTab === 'tags') {
            this.mainView = new TagListView(this.s).in(this.mainViewContainer);
        } else if (this.tabBar.selectedTab === 'groups') {
            this.mainView = new GroupListView(this.s).in(this.mainViewContainer);
        } else if (this.tabBar.selectedTab === 'notes') {
            this.mainView = new NoteView(this.s).in(this.mainViewContainer);
        }
    }

    teardown(): void {
        this.navigationSubscription.unsubscribe();
    }

}
import {TagListView} from "../notes/tag/tagListView";
import {NoteView} from "../notes/note/noteView";
import {Tab, Tabs} from "../component/tabs";
import {services} from "../../service/services";
import {GroupListView} from "../notes/group/groupListView";
import {CompositeComponentBase, div, Div, flexColumn, flexRow} from "../../utility/component";
import {unsubscribe} from "../../utility/subscription";
import {sidebar} from "./sidebar";
import {NavigationState} from "../../service/navigationService";

export class LoggedInContainerView extends CompositeComponentBase {
    private tabBar: Tabs;

    private topLevelContainer?: Div;
    private readonly sideContainer?: Div;
    private mainContainer?: Div;
    private readonly mainViewContainer?: Div;

    private state: NavigationState;

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
            .withTab('note', 'Notes', 'note')
            .withTab('tag', 'Tags', 'tag')
            .withTab('group', 'Groups', 'group')
            .selectionChange((t: Tab) => {
                services.navService.navigate(t.metaData);
            })

        this.mainViewContainer = flexColumn()
            .in(this.mainContainer)
            .height('100%')
            .overflow('hidden')
            .paddingBottom('8px');

        this.tabBar.renderTabs();

        this.onTeardown(unsubscribe(services.navService.navigationEvents$.subscribe((e) => {
            this.tabBar.selectTab(e.state.mainView);
            this.state = e.state;
            this.renderMainView();
        })));
    }

    private renderMainView() {
        this.mainViewContainer.clear();
        // TODO: store nav state here instead of checking the selected tab
        if (this.state.mainView === 'tag') {
            new TagListView().in(this.mainViewContainer);
        } else if (this.state.mainView === 'group') {
            new GroupListView().in(this.mainViewContainer);
        } else if (this.state.mainView === 'note') {
            new NoteView().in(this.mainViewContainer);
        }
    }
}
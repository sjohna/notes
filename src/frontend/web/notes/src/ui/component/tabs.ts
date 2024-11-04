import {div, Div, ElementComponent, flexRow} from "../../utility/component";

export interface Tab {
    tabName: string;
    displayName: string;
    metaData?: any;
}

// TODO: make this a component?
export class Tabs {
    private readonly tabsContainer: Div;

    public selectedTab?: string;

    private tabs: Tab[] = [];

    private tabChanged: (t: Tab) => void;

    constructor() {
        this.tabsContainer = flexRow()
            .marginVertical('4px');
    }

    public renderTabs() {
        this.tabsContainer.clear();

        for (const tab of this.tabs) {
            div(tab.displayName)
                .in(this.tabsContainer)
                .width('100px')
                .cursor('pointer')
                .textAlign('center')
                .background(this.selectedTab === tab.tabName ? 'gray' : 'white')
                .onclick(() => {this.selectedTab = tab.tabName; this.renderTabs(); this.tabChanged?.(tab)})
        }
    }

    public withTab(tabName: string, displayName: string, metaData?: any, selected = false): Tabs {
        this.tabs.push({
            tabName,
            displayName,
            metaData,
        });

        if (selected) {
            this.selectedTab = tabName;
        }

        return this;
    }

    public selectionChange(callback: (t: Tab) => void): Tabs {
        this.tabChanged = callback;
        return this;
    }

    public selectTab(tabName: string) {
        if (tabName !== this.selectedTab) {
            this.selectedTab = tabName;
            this.renderTabs();
        }
    }

    public in<P extends HTMLElement>(parent: ElementComponent<P>): Tabs {
        parent.withChild(this.tabsContainer);
        return this;
    }
}
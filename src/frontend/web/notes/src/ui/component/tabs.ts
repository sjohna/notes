import {clear, div, DivBuilder, ElementBuilder, flexRow} from "../../utility/element";

export interface Tab {
    tabName: string;
    displayName: string;
    metaData?: any;
}

export class Tabs {
    private readonly tabsContainer: DivBuilder;

    public selectedTab?: string;

    private tabs: Tab[] = [];

    private tabChanged: (t: Tab) => void;

    constructor() {
        this.tabsContainer = flexRow()
            .marginVertical('4px');
    }

    public renderTabs() {
        clear(this.tabsContainer);

        for (const tab of this.tabs) {
            const localTab = tab;   // TODO: test without this
            div(tab.displayName)
                .in(this.tabsContainer)
                .width('100px')
                .cursor('pointer')
                .textAlign('center')
                .background(this.selectedTab === tab.tabName ? 'gray' : 'white')
                .onclick(() => {this.selectedTab = tab.tabName; this.renderTabs(); this.tabChanged?.(localTab)})
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

    public in<P extends HTMLElement>(parent: ElementBuilder<P>): Tabs {
        parent.withChild(this.tabsContainer);
        return this;
    }
}
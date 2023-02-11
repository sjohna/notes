import {clear, div, DivBuilder, ElementBuilder, flexRow} from "../../utility/element";

interface Tab {
    tabName: string;
    displayName: string;
}

export class Tabs {
    private readonly tabsContainer: DivBuilder;

    public selectedTab?: string;

    private tabs: Tab[] = [];

    private tabChanged: () => void;

    constructor() {
        this.tabsContainer = flexRow()
            .marginVertical('4px');
    }

    public renderTabs() {
        clear(this.tabsContainer);

        for (const tab of this.tabs) {
            div(tab.displayName)
                .in(this.tabsContainer)
                .width('100px')
                .cursor('pointer')
                .textAlign('center')
                .background(this.selectedTab === tab.tabName ? 'gray' : 'white')
                .onclick(() => {this.selectedTab = tab.tabName; this.renderTabs(); this.tabChanged?.()})
        }
    }

    public withTab(tabName: string, displayName: string, selected = false): Tabs {
        this.tabs.push({
            tabName,
            displayName,
        });

        if (selected) {
            this.selectedTab = tabName;
        }

        return this;
    }

    public selectionChange(callback: () => void): Tabs {
        this.tabChanged = callback;
        return this;
    }

    public in<P extends HTMLElement>(parent: ElementBuilder<P>): Tabs {
        parent.withChild(this.tabsContainer);
        return this;
    }
}
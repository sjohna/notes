import {View} from "../utility/view";
import {AnyBuilder, clear, DivBuilder, newCheckbox, div, flexRow} from "../utility/element";
import {TagView} from "./tagView";
import {QuickNoteView} from "./quickNoteView";


export class ContainerView implements View {
    constructor(private container: AnyBuilder) {}

    private tabBar: DivBuilder;

    private mainContainer?: DivBuilder;

    private view: View;

    private selectedTab?: string;

    setup(): void {
        this.tabBar = flexRow()
            .in(this.container)
            .marginVertical('4px');

        this.selectedTab = 'notes';

        this.mainContainer = div().in(this.container);

        this.renderView();
    }

    private renderTabs() {
        clear(this.tabBar);

        const notesTab = div('Notes')
            .width('100px')
            .cursor('pointer')
            .textAlign('center')
            .onclick(() => {this.selectedTab = 'notes'; this.renderView();})

        if (this.selectedTab === 'notes') {
            notesTab.background('gray');
        }

        notesTab.in(this.tabBar);

        const tagsTab = div('Tags')
            .width('100px')
            .cursor('pointer')
            .textAlign('center')
            .onclick(() => {this.selectedTab = 'tags'; this.renderView();})

        if (this.selectedTab === 'tags') {
            tagsTab.background('gray');
        }

        tagsTab.in(this.tabBar);
    }

    private renderView() {
        this.renderTabs();

        this.view?.teardown();
        if (this.selectedTab === 'tags') {
            this.view = new TagView(this.mainContainer);
        } else {
            this.view = new QuickNoteView(this.mainContainer);
        }
        this.view?.setup();
    }

    teardown(): void {
    }

}
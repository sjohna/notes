import {View} from "../utility/view";
import {clear, newCheckbox, newDiv} from "../utility/element";
import {TagView} from "./tagView";
import {QuickNoteView} from "./quickNoteView";


export class ContainerView implements View {
    constructor(private container: HTMLElement) {}

    private tabBar: HTMLDivElement;

    private mainContainer?: HTMLDivElement;

    private view: View;

    private selectedTab?: string;

    setup(): void {
        this.tabBar = newDiv()
            .display('flex')
            .flexDirection('row')
            .marginVertical('4px')
            .in(this.container)
            .element();

        this.selectedTab = 'notes';

        this.mainContainer = newDiv()
            .in(this.container)
            .element();

        this.renderView();
    }

    private renderTabs() {
        clear(this.tabBar);

        const notesTab = newDiv()
            .width('100px')
            .cursor('pointer')
            .textAlign('center')
            .innerText('Notes')
            .onclick(() => {this.selectedTab = 'notes'; this.renderView();})

        if (this.selectedTab === 'notes') {
            notesTab.background('gray');
        }

        notesTab.in(this.tabBar);

        const tagsTab = newDiv()
            .width('100px')
            .cursor('pointer')
            .textAlign('center')
            .innerText('Tags')
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
import {View} from "../../utility/view";
import {Observable, Subscription} from "rxjs";
import {
    AnyBuilder,
    clear,
    DivBuilder,
    InputBuilder,
    input,
    inlineFlexColumn, div
} from "../../utility/element";
import {tagLabel} from "../component/tagLabel";
import {startDraggingDocumentGroup, startDraggingTag, stopDragging} from "../../service/dragDropService";
import Fuse from "fuse.js";
import {Tag} from "../../service/tagService";
import {Services} from "../../service/services";
import {DocumentGroup} from "../../service/documentGroupService";

const tagSearchOptions = {
    keys: ['name']
}

export class GroupPaletteView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {
        this.documentGroups$ = this.s.documentGroupService.documentGroups$;
    }

    private documentGroups$: Observable<DocumentGroup[]>;
    private documentGroupListContainer: DivBuilder;
    private documentGroupSubscription?: Subscription;
    private documentGroupFuse: Fuse<DocumentGroup>;
    private unfilteredDocumentGroups: DocumentGroup[];

    private search?: string;

    public setup(): void {
        this.documentGroupSubscription?.unsubscribe();
        this.documentGroupListContainer = inlineFlexColumn()
            .in(this.container)
            .height('100%')
            .width('100%');

        this.documentGroupSubscription = this.documentGroups$.subscribe((documentGroups) => this.documentGroupsUpdated(documentGroups))
    }

    public setSearch(search: string) {
        this.search = search;
        if (this.documentGroupFuse && this.search) {
            const filteredDocumentGroups = this.documentGroupFuse.search(this.search).map((r) => r.item)
            this.renderDocumentGroups(filteredDocumentGroups)
        } else {
            this.renderDocumentGroups(this.unfilteredDocumentGroups);
        }
    }

    private documentGroupsUpdated(documentGroups: DocumentGroup[]) {
        this.unfilteredDocumentGroups = documentGroups;
        this.documentGroupFuse = new Fuse(documentGroups, tagSearchOptions);
        if (this.documentGroupFuse && this.search) {
            const filteredDocumentGroups = this.documentGroupFuse.search(this.search).map((r) => r.item)
            this.renderDocumentGroups(filteredDocumentGroups)
        } else {
            this.renderDocumentGroups(this.unfilteredDocumentGroups);
        }
    }

    private renderDocumentGroups(documentGroups: DocumentGroup[]) {
        clear(this.documentGroupListContainer);

        // TODO: need to look at styles. Tags and groups are appearing side-by-side in some cases
        div('Groups')
            .in(this.documentGroupListContainer)
            .textAlign('center')
            .width('100%')

        for (const group of documentGroups) {
            const localGroup = group                // TODO: investigate why this is necessary
            const currentTagLabel = tagLabel(group.name)
                .in(this.documentGroupListContainer)
                .width('fit-content')
                .margin('4px')
                .cursor('pointer')
                .ondragstart(() => this.dragStart(group))
                .ondragend(() => this.dragEnd(group))

        }
    }

    private dragStart(group: DocumentGroup) {
        startDraggingDocumentGroup(group)
        console.log(`Drag start from ${group.name}`)
    }

    private dragEnd(group: DocumentGroup) {
        startDraggingDocumentGroup(group)
        console.log(`Drag end from ${group.name}`)
    }

    public teardown(): void {
        this.documentGroupSubscription?.unsubscribe();
    }
}
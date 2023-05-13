import {View} from "../../../utility/view";
import {Observable, Subscription} from "rxjs";
import {
    AnyBuilder,
    clear,
    DivBuilder,
    InputBuilder,
    input,
    inlineFlexColumn, div
} from "../../../utility/element";
import {tagLabel} from "../../component/tagLabel";
import {startDraggingGroup, startDraggingTag, stopDragging} from "../../../service/dragDropService";
import Fuse from "fuse.js";
import {Tag} from "../../../service/tagService";
import {Services} from "../../../service/services";
import {Group} from "../../../service/groupService";

const tagSearchOptions = {
    keys: ['name']
}

export class GroupPaletteView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {
        this.groups$ = this.s.groupService.groups$;
    }

    private groups$: Observable<Group[]>;
    private groupListContainer: DivBuilder;
    private groupSubscription?: Subscription;
    private groupFuse: Fuse<Group>;
    private unfilteredGroups: Group[];

    private search?: string;

    public setup(): void {
        this.groupSubscription?.unsubscribe();
        this.groupListContainer = inlineFlexColumn()
            .in(this.container)
            .height('100%')
            .width('100%');

        this.groupSubscription = this.groups$.subscribe((groups) => this.groupsUpdated(groups))
    }

    public setSearch(search: string) {
        this.search = search;
        if (this.groupFuse && this.search) {
            const filteredGroups = this.groupFuse.search(this.search).map((r) => r.item)
            this.renderGroups(filteredGroups)
        } else {
            this.renderGroups(this.unfilteredGroups);
        }
    }

    private groupsUpdated(groups: Group[]) {
        this.unfilteredGroups = groups;
        this.groupFuse = new Fuse(groups, tagSearchOptions);
        if (this.groupFuse && this.search) {
            const filteredGroups = this.groupFuse.search(this.search).map((r) => r.item)
            this.renderGroups(filteredGroups)
        } else {
            this.renderGroups(this.unfilteredGroups);
        }
    }

    private renderGroups(groups: Group[]) {
        clear(this.groupListContainer);

        div('Groups')
            .in(this.groupListContainer)
            .textAlign('center')
            .width('100%')

        for (const group of groups) {
            const currentTagLabel = tagLabel(group.name)
                .in(this.groupListContainer)
                .width('fit-content')
                .margin('4px')
                .cursor('pointer')
                .ondragstart(() => this.dragStart(group))
                .ondragend(() => this.dragEnd(group))

        }
    }

    private dragStart(group: Group) {
        startDraggingGroup(group)
    }

    private dragEnd(group: Group) {
        startDraggingGroup(group)
    }

    public teardown(): void {
        this.groupSubscription?.unsubscribe();
    }
}
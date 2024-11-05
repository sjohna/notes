import {Observable, Subscription} from "rxjs";
import {tagLabel} from "../../component/tagLabel";
import {startDraggingGroup} from "../../../service/dragDropService";
import Fuse from "fuse.js";
import {Services} from "../../../service/services";
import {Group} from "../../../service/groupService";
import {div, Div, ElementComponent, inlineFlexColumn} from "../../../utility/component";

const tagSearchOptions = {
    keys: ['name']
}

export class GroupPaletteView extends ElementComponent<HTMLDivElement> {
    constructor(
        private s: Services,
    ) {
        super(document.createElement('div'));

        this.groups$ = this.s.groupService.groups$;

        this.groupSubscription?.unsubscribe();
        this.groupListContainer = inlineFlexColumn()
            .in(this)   // TODO: I hate this too...
            .height('100%')
            .width('100%');

        this.groupSubscription = this.groups$.subscribe((groups) => this.groupsUpdated(groups))
    }

    private groups$: Observable<Group[]>;
    private groupListContainer: Div;
    private groupSubscription?: Subscription;
    private groupFuse: Fuse<Group>;
    private unfilteredGroups: Group[];

    private search?: string;

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
        this.groupListContainer.clear();

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
        super.teardown();

        this.groupSubscription?.unsubscribe();
    }
}
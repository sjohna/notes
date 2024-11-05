import {Observable, Subscription} from "rxjs";
import {tagLabel} from "../tag/tagLabel";
import {startDraggingGroup} from "../../../service/dragDropService";
import Fuse from "fuse.js";
import {services} from "../../../service/services";
import {Group} from "../../../service/groupService";
import {div, Div, ElementComponent, inlineFlexColumn} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";

const tagSearchOptions = {
    keys: ['name']
}

export class GroupPaletteView extends ElementComponent<HTMLDivElement> {
    constructor() {
        super(document.createElement('div'));

        this.groups$ = services.groupService.groups$;

        this.groupListContainer = inlineFlexColumn()
            .in(this)   // TODO: I hate this too...
            .height('100%')
            .width('100%');

        this.onTeardown(unsubscribe(this.groups$.subscribe((groups) => this.groupsUpdated(groups))));
    }

    private groups$: Observable<Group[]>;
    private groupListContainer: Div;
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
}
import {Tag} from "./tagService";
import {Group} from "./groupService";

export interface DragData {
    type: string;
    data: any;
}

let dragData: DragData = null;

export function startDraggingTag(tag: Tag) {
    dragData = {
        type: 'tag',
        data: tag,
    };
}

export function startDraggingGroup(group: Group) {
    dragData = {
        type: 'group',
        data: group,
    };
}

export function getDragData(): DragData {
    return dragData;
}

export function stopDragging() {
    dragData = null;
}


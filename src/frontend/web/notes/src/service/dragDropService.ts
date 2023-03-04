import {Tag} from "./tagService";

let dragData: Tag = null;

export function startDragging(tag: Tag) {
    dragData = tag;
}

export function getDragData(): Tag {
    return dragData;
}

export function stopDragging() {
    dragData = null;
}


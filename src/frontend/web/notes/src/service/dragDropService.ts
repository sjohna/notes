import {Tag} from "./tagService";
import {DocumentGroup} from "./documentGroupService";

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

export function startDraggingDocumentGroup(documentGroup: DocumentGroup) {
    dragData = {
        type: 'documentGroup',
        data: documentGroup,
    };
}

export function getDragData(): DragData {
    return dragData;
}

export function stopDragging() {
    dragData = null;
}


import {Component, RootedComponent} from './component';

export type DragEventHandler = (event: DragEvent) => void;

export function drop() {
    return new Drop();
}

export class Drop {
    dragCounter = 0;

    // these to be called on each event
    onDragEnterCallback: DragEventHandler | null = null;
    onDragLeaveCallback: DragEventHandler | null = null;
    onDragOverCallback: DragEventHandler | null = null;
    onDropCallback: DragEventHandler | null = null;

    // these to be called when drag enters/leaves the element, and it's a valid target
    targetCallback: (() => void) | null = null;
    resetCallback: (() => void) | null = null;

    dragEnter(callback: DragEventHandler): this {
        this.onDragEnterCallback = callback;
        return this;
    }

    dragLeave(callback: DragEventHandler): this {
        this.onDragLeaveCallback = callback;
        return this;
    }

    dragOver(callback: DragEventHandler): this {
        this.onDragOverCallback = callback;
        return this;
    }

    drop(callback: DragEventHandler): this {
        this.onDropCallback = callback;
        return this;
    }

    target(callback: () => void): this {
        this.targetCallback = callback;
        return this;
    }

    reset(callback: () => void): this {
        this.resetCallback = callback;
        return this;
    }

    apply(c: RootedComponent<any>): void {
        const el = c.rootElement;

        el.ondragenter = (ev: DragEvent) => {
            this.dragCounter++;
            if (this.dragCounter > 0) {
                this.targetCallback?.();
            }
            this.onDragEnterCallback?.(ev);
        }

        el.ondragleave = (ev: DragEvent) => {
            this.dragCounter--;
            if (this.dragCounter <= 0) {
                this.resetCallback?.()
            }
            this.onDragLeaveCallback?.(ev)
        }

        el.ondragover = (ev: DragEvent) => {
            ev.preventDefault();
            this.onDragOverCallback?.(ev);
        }

        el.ondrop = (ev: DragEvent) => {
            this.dragCounter = 0;
            this.resetCallback?.()
            this.onDropCallback?.(ev)
        }
    }
}
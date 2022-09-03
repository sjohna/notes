export interface View {
    setup(): void;
    teardown(): void;
}

export class SubViewCollection {
    views: View[] = [];

    setupAndAdd(view: View): void {
        this.views.push(view);
        view.setup();
    }

    teardown(): void {
        for (let view of this.views) {
            view?.teardown();
        }
    }
}
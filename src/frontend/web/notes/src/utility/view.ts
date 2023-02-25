export interface View {
    setup(): void;
    teardown(): void;
}

export class SubViewCollection {
    views: View[] = [];

    public setupAndAdd(view: View): void {
        this.views.push(view);
        view.setup();
    }

    public teardown(): void {
        for (let view of this.views) {
            view?.teardown();
        }
    }
}
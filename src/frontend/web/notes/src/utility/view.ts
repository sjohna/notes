export interface View {
    setup(): void;
    teardown(): void;
}

export class SubViewCollection {
    views: View[] = [];

    add(view: View): void {
        this.views.push(view);
    }

    teardown(): void {
        for (let view of this.views) {
            view?.teardown();
        }
    }
}
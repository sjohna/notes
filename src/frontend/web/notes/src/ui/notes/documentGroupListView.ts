import {SubViewCollection, View} from "../../utility/view";
import {Subscription} from "rxjs";
import {AnyBuilder, clear, DivBuilder, button, div} from "../../utility/element";
import {LabeledTextInput} from "../component/labeledTextInput";
import {DocumentGroup} from "../../service/documentGroupService";
import {Services} from "../../service/services";
import {TagView} from "./tagView";

export class DocumentGroupListView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private documentGroupListContainer: DivBuilder;

    private documentGroupSubscription?: Subscription;

    private documentGroupName: LabeledTextInput;
    private documentGroupDescription: LabeledTextInput;

    private documentGroupViews: SubViewCollection;

    setup(): void {
        this.documentGroupSubscription?.unsubscribe();

        this.render();
        this.documentGroupSubscription = this.s.documentGroupService.documentGroups$.subscribe((documentGroups) => this.renderDocumentGroups(documentGroups))
        this.s.documentGroupService.get();
    }

    private render() {
        clear(this.container);

        this.documentGroupName = new LabeledTextInput('Name:')
        this.documentGroupDescription = new LabeledTextInput('Description:')

        div()
            .in(this.container)
            .withChildren([
                this.documentGroupName.container,
                this.documentGroupDescription.container,
                button('Create Group')
                    .onclick(() => this.createDocumentGroup())
            ]);

        this.documentGroupListContainer = div()
            .in(this.container);
    }

    private createDocumentGroup() {
        this.s.documentGroupService.createDocumentGroup(this.documentGroupName.value, this.documentGroupDescription.value ?? undefined);
    }

    private renderDocumentGroups(documentGroups: DocumentGroup[]) {
        clear(this.documentGroupListContainer);
        this.documentGroupViews?.teardown();
        this.documentGroupViews = new SubViewCollection();

        for (const documentGroup of documentGroups) {
            const documentGroupContainer = div().in(this.documentGroupListContainer);
            this.documentGroupViews.setupAndAdd(new TagView(documentGroupContainer, documentGroup, this.s));
        }
    }

    teardown(): void {
        this.documentGroupSubscription?.unsubscribe();
        this.documentGroupViews.teardown();
    }
}
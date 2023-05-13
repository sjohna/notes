import {SubViewCollection, View} from "../../../utility/view";
import {Subscription} from "rxjs";
import {AnyBuilder, clear, DivBuilder, button, div} from "../../../utility/element";
import {LabeledTextInput} from "../../component/labeledTextInput";
import {Group} from "../../../service/groupService";
import {Services} from "../../../service/services";
import {TagView} from "../tagView";
import {GroupCardView} from "./groupCardView";

export class GroupListView implements View {
    constructor(
        private container: AnyBuilder,
        private s: Services,
    ) {}

    private groupListContainer: DivBuilder;

    private groupSubscription?: Subscription;

    private groupName: LabeledTextInput;
    private groupDescription: LabeledTextInput;

    private groupViews: SubViewCollection;

    setup(): void {
        this.groupSubscription?.unsubscribe();

        this.render();
        this.groupSubscription = this.s.groupService.groups$.subscribe((groups) => this.renderGroups(groups))
        this.s.groupService.get();
    }

    private render() {
        clear(this.container);

        this.groupName = new LabeledTextInput('Name:')
        this.groupDescription = new LabeledTextInput('Description:')

        div()
            .in(this.container)
            .withChildren([
                this.groupName.container,
                this.groupDescription.container,
                button('Create Group')
                    .onclick(() => this.createGroup())
            ]);

        this.groupListContainer = div()
            .in(this.container);
    }

    private createGroup() {
        this.s.groupService.createGroup(this.groupName.value, this.groupDescription.value ?? undefined);
    }

    private renderGroups(groups: Group[]) {
        clear(this.groupListContainer);
        this.groupViews?.teardown();
        this.groupViews = new SubViewCollection();

        for (const group of groups) {
            const groupContainer = div().in(this.groupListContainer);
            this.groupViews.setupAndAdd(new GroupCardView(groupContainer, group, this.s));
        }
    }

    teardown(): void {
        this.groupSubscription?.unsubscribe();
        this.groupViews.teardown();
    }
}
import {Subscription} from "rxjs";
import {LabeledTextInput} from "../../component/labeledTextInput";
import {Group} from "../../../service/groupService";
import {Services} from "../../../service/services";
import {GroupCardView} from "./groupCardView";
import {button, ComponentBase, Div, div} from "../../../utility/component";

export class GroupListView extends ComponentBase {
    private container: Div = div();

    constructor(
        private s: Services,
    ) {
        super();

        this.groupSubscription?.unsubscribe();

        this.render();
        this.groupSubscription = this.s.groupService.groups$.subscribe((groups) => this.renderGroups(groups))
        this.s.groupService.get();
    }

    public root(): HTMLElement {
        return this.container.root();
    }

    private groupListContainer: Div;

    private groupSubscription?: Subscription;

    private groupName: LabeledTextInput;
    private groupDescription: LabeledTextInput;

    private render() {
        this.container.clear();

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
        this.groupListContainer.clear();

        for (const group of groups) {
            new GroupCardView(group, this.s).in(this.groupListContainer)
        }
    }

    teardown(): void {
        this.groupSubscription?.unsubscribe();
        this.groupListContainer.teardown();
    }
}
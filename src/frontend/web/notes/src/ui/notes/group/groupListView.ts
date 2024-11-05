import {Subscription} from "rxjs";
import {Group} from "../../../service/groupService";
import {Services} from "../../../service/services";
import {groupCardView} from "./groupCardView";
import {button, CompositeComponentBase, Div, div, ValueComponent} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {labelledTextBox} from "../../component/labeledTextInput";

export class GroupListView extends CompositeComponentBase {
    constructor(
        private s: Services,
    ) {
        super(div());

        this.render();
        this.onTeardown(unsubscribe(this.s.groupService.groups$.subscribe((groups) => this.renderGroups(groups))));
        this.s.groupService.get();
    }

    private groupListContainer: Div;

    private groupName: ValueComponent<string>;
    private groupDescription: ValueComponent<string>;

    private render() {
        this.root.clear();

        this.groupName = labelledTextBox('Name:')
        this.groupDescription = labelledTextBox('Description:')

        div()
            .in(this.root)
            .withChildren([
                this.groupName,
                this.groupDescription,
                button('Create Group')
                    .onclick(() => this.createGroup())
            ]);

        this.groupListContainer = div()
            .in(this.root);
    }

    private createGroup() {
        this.s.groupService.createGroup(this.groupName.getValue(), this.groupDescription.getValue() ?? undefined);
    }

    private renderGroups(groups: Group[]) {
        this.groupListContainer.clear();

        for (const group of groups) {
            groupCardView(group).in(this.groupListContainer)
        }
    }
}
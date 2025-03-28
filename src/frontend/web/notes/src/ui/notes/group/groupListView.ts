import {Group} from "../../../service/groupService";
import {groupCardView} from "./groupCardView";
import {button, CompositeComponentBase, Div, div, ValueComponent} from "../../../utility/component";
import {unsubscribe} from "../../../utility/subscription";
import {labelledTextBox} from "../../component/labeledTextInput";
import {services} from "../../../service/services";
import {APIData} from "../../../service/apiData";

export class GroupListView extends CompositeComponentBase {
    constructor() {
        super(div());

        this.render();
        this.onTeardown(unsubscribe(services.groupService.groups$.subscribe((groups) => this.renderGroups(groups))));
        services.groupService.get();
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
        services.groupService.createGroup(this.groupName.getValue(), this.groupDescription.getValue() ?? undefined);
    }

    private renderGroups(groups: APIData<Group[]>) {
        this.groupListContainer.clear();

        // TODO: loading and error

        for (const group of groups.data) {
            groupCardView(group).in(this.groupListContainer)
        }
    }
}
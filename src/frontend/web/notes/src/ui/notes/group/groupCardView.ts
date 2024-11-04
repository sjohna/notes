import {Services} from "../../../service/services";
import {Group} from "../../../service/groupService";
import {tagLabel} from "../../component/tagLabel";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {ComponentBase, Div, div, flexColumn, flexRow} from "../../../utility/component";

export class GroupCardView extends ComponentBase {
    private container: Div = div();

    constructor(
        private group: Group,
        private s: Services,
    ) {
        super();

        const createdDateTime = ZonedDateTime.parse(this.group.insertedAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('yyyy-M-dd h:mm a').withLocale(Locale.US));

        flexColumn()
            .in(this.container)
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChildren([
                flexRow()
                    .withChildren([
                        tagLabel(this.group.name)
                            .marginRight('8px'),
                        div(String(this.group.documentCount))
                            .fontSize('16px')
                            .borderRadius('16px')
                            .background('blue')
                            .color('white')
                            .width('16px')
                            .textAlign('center')
                            .marginRight('8px'),
                        div(createdTimeString)
                            .fontSize('12px'),
                    ]),
                div(this.group.description),
            ])
    }

    root(): HTMLElement {
        return this.container.root();
    }
}
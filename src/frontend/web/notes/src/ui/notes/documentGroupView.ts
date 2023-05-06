import {View} from "../../utility/view";
import {Services} from "../../service/services";
import {AnyBuilder, div, flexCol, flexRow} from "../../utility/element";
import {DocumentGroup} from "../../service/documentGroupService";
import {tagLabel} from "../component/tagLabel";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";

export class DocumentGroupView implements View {
    constructor(
        private container: AnyBuilder,
        private documentGroup: DocumentGroup,
        private s: Services,
    ) {}

    setup(): void {
        const createdDateTime = ZonedDateTime.parse(this.documentGroup.insertedAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('yyyy-M-dd h:mm a').withLocale(Locale.US));

        flexCol()
            .in(this.container)
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChildren([
                flexRow()
                    .withChildren([
                        tagLabel(this.documentGroup.name)
                            .marginRight('8px'),
                        div(String(this.documentGroup.documentCount))
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
                div(this.documentGroup.description),
            ])
    }

    teardown(): void {
    }

}
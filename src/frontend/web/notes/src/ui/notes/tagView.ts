import {View} from "../../utility/view";
import {Services} from "../../service/services";
import {AnyBuilder, div, flexCol, flexRow} from "../../utility/element";
import {Tag} from "../../service/tagService";
import {tagLabel} from "../component/tagLabel";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";

export class TagView implements View {
    constructor(
        private container: AnyBuilder,
        private tag: Tag,
        private s: Services,
    ) {}

    setup(): void {
        const createdDateTime = ZonedDateTime.parse(this.tag.insertedAt).withZoneSameInstant(ZoneId.of('America/Denver'));
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
                        tagLabel(this.tag.name)
                            .marginRight('8px'),
                        div(String(this.tag.documentCount))
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
                div(this.tag.description),
            ])
    }

    teardown(): void {
    }

}
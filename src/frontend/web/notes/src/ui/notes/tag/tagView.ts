import {Tag} from "../../../service/tagService";
import {tagLabel} from "../../component/tagLabel";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {Div, div, flexColumn, flexRow} from "../../../utility/component";

export function tagView(tag: Tag): Div {
    const createdDateTime = ZonedDateTime.parse(tag.insertedAt).withZoneSameInstant(ZoneId.of('America/Denver'));
    const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('yyyy-M-dd h:mm a').withLocale(Locale.US));

    return flexColumn()
        .background('lightgray')
        .margin('8px')
        .padding('4px')
        .width('380px')
        .borderRadius('10px')
        .withChildren([
            flexRow()
                .withChildren([
                    tagLabel(tag.name)
                        .marginRight('8px'),
                    div(String(tag.documentCount))
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
            div(tag.description),
        ])
}
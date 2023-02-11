import {View} from "../../utility/view";
import {Document} from "../../service/quickNotes";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {AnyBuilder, div, flexRow} from "../../utility/element";
import {tagLabel} from "../component/tagLabel";

export class QuickNoteCardView implements View {
    constructor(private container: AnyBuilder, private note: Document) {}

    setup(): void {
        const createdDateTime = ZonedDateTime.parse(this.note.documentTime).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.US));

        const timeAndTags = flexRow()
            .alignItems('center')
            .withChild(
                div(createdTimeString)
                    .fontSize('12px')
                    .marginRight('4px')
            )

        if (this.note.tagNames) {
            for (let tag of this.note.tagNames) {
                tagLabel(tag)
                    .in(timeAndTags)
                    .marginHorizontal('4px')
            }
        }

        div()
            .in(this.container)
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChildren([
                timeAndTags,
                div(this.note.content)
            ]);
    }

    teardown(): void {

    }


}
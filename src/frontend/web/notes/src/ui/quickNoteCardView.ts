import {View} from "../utility/view";
import {Document} from "../service/quickNotes";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {newDiv} from "../utility/element";

export class QuickNoteCardView implements View {
    constructor(private container: HTMLElement, private note: Document) {}

    setup(): void {
        const createdDateTime = ZonedDateTime.parse(this.note.documentTime).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.US));

        newDiv()
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChild( // time
                newDiv()
                    .innerText(createdTimeString)
                    .fontSize('12px')
                    .element()
            )
            .withChild( // content
                newDiv()
                    .innerText(this.note.content)
                    .element()
            )
            .in(this.container);
    }

    teardown(): void {

    }


}
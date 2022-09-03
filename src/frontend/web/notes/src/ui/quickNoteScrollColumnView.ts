import {View} from "../utility/view";
import {Document} from "../service/quickNotes"
import {clear, newDiv, newHr, newSpan} from "../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";

export class QuickNoteScrollColumnView implements View {
    constructor(private container: HTMLElement, private notes: Document[]) {}

    setup(): void {
        clear(this.container);

        let lastDate: string | undefined;

        for (let note of this.notes) {
            const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
            const createdDate = createdDateTime.format(DateTimeFormatter.ofPattern('y-M-d'))
            if (createdDate != lastDate) {
                this.container.appendChild(this.dateHeader(createdDate));

                lastDate = createdDate;
            }

            this.container.appendChild(this.noteCard(note));
        }
    }

    teardown(): void {
    }

    private dateHeader(date: string): HTMLDivElement {
        return newDiv()
            .width('380px')
            .display('inline-flex')
            .marginHorizontal('8px')
            .padding('4px')
            .withChild( // left line
                newHr()
                    .flexGrow('1')
                    .element()
            )
            .withChild( // date
                newSpan()
                    .marginHorizontal('24px')
                    .innerText(date)
                    .element()
            )
            .withChild( // right line
                newHr()
                    .flexGrow('1')
                    .element()
            )
            .element();
    }

    private noteCard(note: Document): HTMLDivElement {
        const createdDateTime = ZonedDateTime.parse(note.createdAt).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('h:m a').withLocale(Locale.US));

        return newDiv()
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
                    .innerText(note.content)
                    .element()
            )
            .element()
    }
}
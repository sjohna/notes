import {SubViewCollection, View} from "../utility/view";
import {Document} from "../service/quickNotes"
import {clear, newDiv, newHr, newSpan} from "../utility/element";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {QuickNoteCardView} from "./quickNoteCardView";

export class QuickNoteScrollColumnView implements View {
    constructor(private container: HTMLElement, private notes: Document[]) {}

    private subViews = new SubViewCollection();

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

            this.subViews.setupAndAdd(
                new QuickNoteCardView(this.container, note)
            );
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
}
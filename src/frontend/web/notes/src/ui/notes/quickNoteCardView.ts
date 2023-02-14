import {View} from "../../utility/view";
import {Document} from "../../service/quickNotes";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {AnyBuilder, clear, div, DivBuilder, flexRow} from "../../utility/element";
import {tagLabel} from "../component/tagLabel";
import {getDragData} from "../../service/dragDropService";
import {addTagToDocument} from "../../service/tags";

export class QuickNoteCardView implements View {
    private card: DivBuilder;
    private cardContainer: DivBuilder;

    private dragCounter = 0;

    constructor(private container: AnyBuilder, private note: Document) {}

    setup(): void {
        this.cardContainer = div()
            .in(this.container);

        this.renderCard();
    }

    private renderCard() {
        clear(this.cardContainer);
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

        this.card = div()
            .in(this.cardContainer)
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChildren([
                timeAndTags,
                div(this.note.content)
            ])
            .ondragenter(() => this.dragEnter())
            .ondragleave(() => this.dragLeave())
            .ondrop(() => this.drop())
            .ondragover((ev) => ev.preventDefault());
    }

    private setCardBackground() {
        if (this.dragCounter > 0) {
            this.card.background('gray');
        } else {
            this.card.background('lightgray');
        }
    }

    private dragEnter() {
        this.dragCounter += 1;
        this.setCardBackground();
        console.log(`Drag enter document ${this.note.id}`);
    }

    private dragLeave() {
        this.dragCounter -= 1;
        this.setCardBackground();
        console.log(`Drag leave document ${this.note.id}`);
    }

    private drop() {
        this.dragCounter = 0;
        this.setCardBackground();

        const tag = getDragData();

        if (!this.note.tagNames || !this.note.tagNames.find((name) => name === tag.name)) {
            // TODO: figure out how to refresh just this document
            addTagToDocument(tag.id, this.note.id);

            if (!this.note.tagNames) {
                this.note.tagNames = [];
            }

            this.note.tagNames.push(tag.name);
            this.renderCard();
        }

        console.log(`Drop document ${this.note.id}`);
    }

    public teardown(): void {

    }


}
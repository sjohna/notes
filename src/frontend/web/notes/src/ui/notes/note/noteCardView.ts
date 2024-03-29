import {View} from "../../../utility/view";
import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {AnyBuilder, clear, div, DivBuilder, flexRow} from "../../../utility/element";
import {tagLabel} from "../../component/tagLabel";
import {getDragData} from "../../../service/dragDropService";
import {Subscription} from "rxjs";
import {Tag} from "../../../service/tagService";
import {Document} from "../../../service/noteService";
import {Services} from "../../../service/services";
import {Group} from "../../../service/groupService";

export class NoteCardView implements View {
    private card: DivBuilder;
    private cardContainer: DivBuilder;

    private dragCounter = 0;

    private updateSubscription: Subscription;

    constructor(
        private container: AnyBuilder,
        private note: Document,
        private s: Services,
    ) {}

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

        if (this.note.tags) {
            for (let tag of this.note.tags) {
                const currentTag = tagLabel(tag.name)
                    .in(timeAndTags)
                    .marginHorizontal('4px')
                    .onclick((ev: MouseEvent) => {
                        if (ev.ctrlKey) {
                            this.removeTag(tag)
                        }
                    })
                    // TODO: better detect and immediately remove red background when ctrl key is released. This will only change the background when the mouse moves
                    .onmousemove((ev: MouseEvent) => {
                        if (ev.ctrlKey) {
                            currentTag.background('red')
                        } else {
                            currentTag.background('white')
                        }
                    })
                    .onmouseleave(() => {
                        currentTag.background('white')
                    })
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
    }

    private dragLeave() {
        this.dragCounter -= 1;
        this.setCardBackground();
    }

    private drop() {
        this.dragCounter = 0;
        this.setCardBackground();

        const dragData = getDragData();

        if (dragData?.type === 'tag') {
            const newTag = dragData.data as Tag;

            if (!this.note.tags || !this.note.tags.find((tag) => newTag.id === tag.id)) {
                if (!this.updateSubscription) {
                    this.updateSubscription = this.s.noteService.documentUpdated$$.asObservable().subscribe((updatedDocument) => this.checkDocumentUpdate(updatedDocument));
                }

                this.s.tagService.addTagToDocument(newTag.id, this.note.id);
            }
        } else if (dragData?.type === 'group') {
            const newGroup = dragData.data as Group;

            if (!this.note.groups || !this.note.groups.find((group) => newGroup.id === group.id)) {
                if (!this.updateSubscription) {
                    this.updateSubscription = this.s.noteService.documentUpdated$$.asObservable().subscribe((updatedDocument) => this.checkDocumentUpdate(updatedDocument));
                }

                this.s.groupService.addDocumentToGroup(newGroup.id, this.note.id);
            }
        }
    }

    private checkDocumentUpdate(newDocument: Document) {
        if (newDocument.id == this.note.id) {
            this.note = newDocument;
            this.renderCard()
        }
    }

    private removeTag(tagToRemove: Tag) {
        if (!this.updateSubscription) {
            this.updateSubscription = this.s.noteService.documentUpdated$$.asObservable().subscribe((updatedDocument) => this.checkDocumentUpdate(updatedDocument));
        }
        this.s.tagService.removeTagFromDocument(tagToRemove.id, this.note.id)
    }

    public teardown(): void {
        this.updateSubscription?.unsubscribe();
    }
}
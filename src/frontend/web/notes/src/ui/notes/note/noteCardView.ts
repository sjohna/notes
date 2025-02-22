import {DateTimeFormatter, ZonedDateTime, ZoneId} from "@js-joda/core";
import {Locale} from "@js-joda/locale_en-us";
import {tagLabel} from "../tag/tagLabel";
import {getDragData} from "../../../service/dragDropService";
import {Subscription} from "rxjs";
import {Tag} from "../../../service/tagService";
import {Document} from "../../../service/noteService";
import {services} from "../../../service/services";
import {Group} from "../../../service/groupService";
import {CompositeComponentBase, div, Div, flexRow} from "../../../utility/component";
import {drop} from "../../../utility/drop";

export class NoteCardView extends CompositeComponentBase {
    private card: Div;

    private dragCounter = 0;

    private updateSubscription: Subscription;

    constructor(
        private note: Document
    ) {
        super(div());

        this.renderCard();
    }

    private renderCard() {
        this.root.clear();
        const createdDateTime = ZonedDateTime.parse(this.note.documentTime).withZoneSameInstant(ZoneId.of('America/Denver'));
        const createdTimeString = createdDateTime.format(DateTimeFormatter.ofPattern('h:mm a').withLocale(Locale.US));

        const timeAndTags = flexRow()
            .alignItems('center')
            .withChild(
                div(createdTimeString)
                    .fontSize('12px')
                    .marginRight('4px')
                    .cursor('pointer')
                    .onclick((ev) => services.navService.navigate('note', this.note.id))
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
            .in(this.root)
            .background('lightgray')
            .margin('8px')
            .padding('4px')
            .width('380px')
            .borderRadius('10px')
            .withChildren([
                timeAndTags,
                div(this.note.latestVersion.content)
            ])
            .drop(drop()
                .target(() => this.card.background('gray'))
                .reset(() => this.card.background('lightgray'))
                .drop(() => this.dropEvent()))
    }


    private dropEvent() {

        const dragData = getDragData();

        if (dragData?.type === 'tag') {
            const newTag = dragData.data as Tag;

            if (!this.note.tags || !this.note.tags.find((tag) => newTag.id === tag.id)) {
                if (!this.updateSubscription) {
                    this.updateSubscription = services.noteService.documentUpdated$$.asObservable().subscribe((updatedDocument) => this.checkDocumentUpdate(updatedDocument));
                }

                services.tagService.addTagToDocument(newTag.id, this.note.id);
            }
        } else if (dragData?.type === 'group') {
            const newGroup = dragData.data as Group;

            if (!this.note.groups || !this.note.groups.find((group) => newGroup.id === group.id)) {
                if (!this.updateSubscription) {
                    this.updateSubscription = services.noteService.documentUpdated$$.asObservable().subscribe((updatedDocument) => this.checkDocumentUpdate(updatedDocument));
                }

                services.groupService.addDocumentToGroup(newGroup.id, this.note.id);
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
            this.updateSubscription = services.noteService.documentUpdated$$.asObservable().subscribe((updatedDocument) => this.checkDocumentUpdate(updatedDocument));
        }
        services.tagService.removeTagFromDocument(tagToRemove.id, this.note.id)
    }

    public teardown(): void {
        super.teardown();

        // TODO: better way to handle subscriptions?
        this.updateSubscription?.unsubscribe();
    }
}
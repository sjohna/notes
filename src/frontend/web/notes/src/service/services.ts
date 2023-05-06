import {DocumentFilterService} from "./documentFilterService";
import {QuickNoteService} from "./quickNoteService";
import {TagService} from "./tagService";
import {TotalQuickNotesOnDatesService} from "./totalQuickNotesOnDatesService";
import {DocumentGroupService} from "./documentGroupService";

export interface Services {
    documentFilterService: DocumentFilterService;
    quickNoteService: QuickNoteService;
    tagService: TagService;
    totalQuickNotesOnDatesService: TotalQuickNotesOnDatesService;
    documentGroupService: DocumentGroupService;
}
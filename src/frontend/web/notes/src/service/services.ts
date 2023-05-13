import {DocumentFilterService} from "./documentFilterService";
import {NoteService} from "./noteService";
import {TagService} from "./tagService";
import {TotalNotesOnDatesService} from "./totalNotesOnDatesService";
import {GroupService} from "./groupService";

export interface Services {
    documentFilterService: DocumentFilterService;
    noteService: NoteService;
    tagService: TagService;
    totalNotesOnDatesService: TotalNotesOnDatesService;
    groupService: GroupService;
}
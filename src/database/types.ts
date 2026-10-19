import { Folder, FolderModel } from "@/database/tables/Folder";
import { Note, NoteModel } from "@/database/tables/Note";
import { Tag, TagModel } from "@/database/tables/Tag";

export type TableModels = {
  folders: FolderModel;
  tags: TagModel;
  notes: NoteModel;
};

export type TableData = {
  folders: Folder;
  tags: Tag;
  notes: Note;
};

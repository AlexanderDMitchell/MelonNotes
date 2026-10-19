import { createMelon } from "@alexmitchell/melondb";
import { FolderModel, folderSchema } from "@/database/tables/Folder";
import { NoteModel, noteSchema } from "@/database/tables/Note";
import { TagModel, tagSchema } from "@/database/tables/Tag";
import type { TableData, TableModels } from "@/database/types";

const version = 1;

const modelClasses = [
  FolderModel, //
  TagModel,
  NoteModel,
];

const tables = [
  folderSchema, //
  tagSchema,
  noteSchema,
];

/**
 * App-wide MelonDB instance.
 * Table names are typed against TableModels / TableData.
 */
export const melon = createMelon<TableModels, TableData>({
  version,
  tables,
  modelClasses,
  migrations: [],
});

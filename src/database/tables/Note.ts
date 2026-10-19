import { Model } from "@nozbe/watermelondb";
import { text } from "@nozbe/watermelondb/decorators";
import { tableSchema } from "@nozbe/watermelondb/Schema";

export type Note = Omit<NoteModel, keyof Model>;

export class NoteModel extends Model {
  static table = "notes";

  @text("title")
  title!: string;

  @text("body")
  body!: string;

  @text("folder_id")
  folderId!: string;

  /** Optional — empty string when untagged */
  @text("tag_id")
  tagId!: string;

  @text("created_date")
  createdDate!: string;

  @text("updated_date")
  updatedDate!: string;
}

export const noteSchema = tableSchema({
  name: "notes",
  columns: [
    { name: "title", type: "string" },
    { name: "body", type: "string" },
    { name: "folder_id", type: "string", isIndexed: true },
    { name: "tag_id", type: "string", isIndexed: true },
    { name: "created_date", type: "string" },
    { name: "updated_date", type: "string", isIndexed: true },
  ],
});

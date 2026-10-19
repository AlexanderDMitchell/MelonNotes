import { Model } from "@nozbe/watermelondb";
import { text } from "@nozbe/watermelondb/decorators";
import { tableSchema } from "@nozbe/watermelondb/Schema";

export type Folder = Omit<FolderModel, keyof Model>;

export class FolderModel extends Model {
  static table = "folders";

  @text("name")
  name!: string;

  @text("color")
  color!: string;

  @text("created_date")
  createdDate!: string;

  @text("updated_date")
  updatedDate!: string;
}

export const folderSchema = tableSchema({
  name: "folders",
  columns: [
    { name: "name", type: "string" },
    { name: "color", type: "string" },
    { name: "created_date", type: "string" },
    { name: "updated_date", type: "string", isIndexed: true },
  ],
});

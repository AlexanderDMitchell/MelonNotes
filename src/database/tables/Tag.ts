import { Model } from "@nozbe/watermelondb";
import { text } from "@nozbe/watermelondb/decorators";
import { tableSchema } from "@nozbe/watermelondb/Schema";

export type Tag = Omit<TagModel, keyof Model>;

export class TagModel extends Model {
  static table = "tags";

  @text("name")
  name!: string;

  @text("color")
  color!: string;

  @text("created_date")
  createdDate!: string;

  @text("updated_date")
  updatedDate!: string;
}

export const tagSchema = tableSchema({
  name: "tags",
  columns: [
    { name: "name", type: "string" },
    { name: "color", type: "string" },
    { name: "created_date", type: "string" },
    { name: "updated_date", type: "string", isIndexed: true },
  ],
});

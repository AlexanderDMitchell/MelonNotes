import { melon } from "@/database";
import type { FolderModel } from "@/database/tables/Folder";
import type { NoteModel } from "@/database/tables/Note";
import type { TagModel } from "@/database/tables/Tag";

const now = () => new Date().toISOString();

export const createFolder = async (name: string) => {
  const date = now();
  return melon.insert("folders", {
    name: name.trim() || "Untitled",
    color: "#2F6F4E",
    createdDate: date,
    updatedDate: date,
  });
};

export const createTag = async (name: string) => {
  const date = now();
  return melon.insert("tags", {
    name: name.trim().toLowerCase() || "tag",
    color: "#8B4D6B",
    createdDate: date,
    updatedDate: date,
  });
};

export const createNote = async (folderId: string, tagId = "") => {
  const date = now();
  return melon.insert("notes", {
    title: "Untitled",
    body: "",
    folderId,
    tagId,
    createdDate: date,
    updatedDate: date,
  });
};

export const renameFolder = (folder: FolderModel, name: string) =>
  melon.updateColumn(folder, "name", name.trim() || folder.name);

export const renameTag = (tag: TagModel, name: string) =>
  melon.updateColumn(tag, "name", name.trim().toLowerCase() || tag.name);

export const saveNote = (
  note: NoteModel,
  fields: { title: string; body: string; tagId: string },
) =>
  melon.updateColumns(note, [
    { property: "title", value: fields.title },
    { property: "body", value: fields.body },
    { property: "tagId", value: fields.tagId },
  ]);

export const deleteFolder = async (folderId: string) => {
  // Soft-delete notes in the folder first, then the folder
  const notes = await melon
    .get("notes")
    .query()
    .fetch()
    .then((rows) => rows.filter((n) => n.folderId === folderId));
  await melon.deleteBatch(notes);
  await melon.deleteRowById("folders", folderId);
};

export const deleteTag = async (tagId: string) => {
  const notes = await melon
    .get("notes")
    .query()
    .fetch()
    .then((rows) => rows.filter((n) => n.tagId === tagId));
  for (const note of notes) {
    await melon.updateColumn(note, "tagId", "");
  }
  await melon.deleteRowById("tags", tagId);
};

export const deleteNote = (noteId: string) =>
  melon.deleteRowById("notes", noteId);

export const resetDemo = async () => {
  await melon.resetDatabase();
};

import { melon } from "@/database";

const now = () => new Date().toISOString();

/** Seed a few folders, tags, and notes so the demo isn't empty. */
export const seedIfEmpty = async () => {
  const folderCount = await melon.getRowCount("folders");
  if (folderCount > 0) return;

  const date = now();

  const personalId = await melon.insert("folders", {
    name: "Personal",
    color: "#2F6F4E",
    createdDate: date,
    updatedDate: date,
  });

  const workId = await melon.insert("folders", {
    name: "Work",
    color: "#3D5A80",
    createdDate: date,
    updatedDate: date,
  });

  const ideaTagId = await melon.insert("tags", {
    name: "idea",
    color: "#C47B2D",
    createdDate: date,
    updatedDate: date,
  });

  const todoTagId = await melon.insert("tags", {
    name: "todo",
    color: "#8B4D6B",
    createdDate: date,
    updatedDate: date,
  });

  await melon.insertBatch("notes", [
    {
      title: "Welcome to Melon Notes",
      body: "This demo uses @alexmitchell/melondb — typed insert/update/delete over WatermelonDB.",
      folderId: personalId,
      tagId: ideaTagId,
      createdDate: date,
      updatedDate: date,
    },
    {
      title: "Grocery list",
      body: "Eggs, oat milk, spinach, coffee beans.",
      folderId: personalId,
      tagId: todoTagId,
      createdDate: date,
      updatedDate: date,
    },
    {
      title: "Sprint notes",
      body: "Ship the MelonDB example app. Keep the UI minimal — focus on the API.",
      folderId: workId,
      tagId: todoTagId,
      createdDate: date,
      updatedDate: date,
    },
  ]);
};

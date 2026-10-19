# Melon Notes

Minimal example app for [`@alexmitchell/melondb`](https://www.npmjs.com/package/@alexmitchell/melondb) — typed helpers over [WatermelonDB](https://github.com/Nozbe/WatermelonDB).

Three tables so you can see how MelonDB scales past a single collection:

| Table     | Role                                      |
| --------- | ----------------------------------------- |
| `folders` | Organize notes (Personal, Work, …)        |
| `tags`    | Cross-cutting labels (`idea`, `todo`, …)  |
| `notes`   | Title + body, linked via `folder_id` / `tag_id` |

## Run

```bash
npm install
npm run web
```

Web uses MelonDB’s LokiJS + IndexedDB adapter automatically (`.web.ts` resolution). For iOS/Android you’ll need a dev client / native build because WatermelonDB uses SQLite there.

## What to look at

1. **`src/database/`** — models, schema, and `createMelon<TableModels, TableData>(…)`
2. **`src/actions.ts`** — `melon.insert`, `insertBatch`, `updateColumn(s)`, `deleteRowById`, `deleteBatch`, `resetDatabase`
3. **`src/components/*`** — `withObservables` + `melon.enhance` for typed live queries

### API snippets used here

```ts
await melon.insert("folders", { name, color, createdDate, updatedDate });
await melon.insertBatch("notes", rows);
await melon.updateColumn(folder, "name", "Renamed");
await melon.updateColumns(note, [
  { property: "title", value },
  { property: "body", value },
]);
await melon.deleteRowById("notes", id);
await melon.resetDatabase(); // gates UI via subscribeDatabaseAvailable
```

```ts
const enhancer = withObservables(["folderId"], ({ folderId }) => ({
  notes: melon.get("notes").query(Q.where("folder_id", folderId)).observe(),
}));
export default melon.enhance<Injected, Query>(enhancer, NoteList);
```

## Layout

```
src/
  database/
    index.ts          # createMelon
    types.ts          # TableModels + TableData
    seed.ts
    tables/
      Folder.ts
      Tag.ts
      Note.ts
  actions.ts          # thin wrappers over melon.*
  components/         # UI + observables
app/                  # expo-router entry
```

import { Pressable, StyleSheet, Text, View } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { melon } from "@/database";
import type { NoteModel } from "@/database/tables/Note";
import { colors, space } from "@/theme";

type Injected = {
  notes: NoteModel[];
};

type Query = {
  folderId: string | null;
  tagId: string | null;
};

type Props = {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
};

const enhancer = withObservables(
  ["folderId", "tagId"],
  ({ folderId, tagId }: Query) => {
    let query = melon.get("notes").query(Q.sortBy("updated_date", Q.desc));
    if (folderId && tagId) {
      query = melon
        .get("notes")
        .query(
          Q.where("folder_id", folderId),
          Q.where("tag_id", tagId),
          Q.sortBy("updated_date", Q.desc),
        );
    } else if (folderId) {
      query = melon
        .get("notes")
        .query(
          Q.where("folder_id", folderId),
          Q.sortBy("updated_date", Q.desc),
        );
    } else if (tagId) {
      query = melon
        .get("notes")
        .query(Q.where("tag_id", tagId), Q.sortBy("updated_date", Q.desc));
    }

    return { notes: query.observe() };
  },
);

function NoteListView({ notes, selectedNoteId, onSelect }: Injected & Props) {
  if (notes.length === 0) {
    return (
      <Text style={styles.empty}>No notes here yet. Create one below.</Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {notes.map((note) => {
        const selected = note.id === selectedNoteId;
        return (
          <Pressable
            key={note.id}
            onPress={() => onSelect(note.id)}
            style={[styles.row, selected && styles.rowSelected]}
          >
            <Text style={styles.title} numberOfLines={1}>
              {note.title || "Untitled"}
            </Text>
            <Text style={styles.preview} numberOfLines={2}>
              {note.body || "Empty note"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const NoteList = melon.enhance<Injected, Query, Props>(
  enhancer,
  NoteListView,
);

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  row: {
    padding: space.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: 4,
  },
  rowSelected: {
    borderColor: colors.accent,
    backgroundColor: "#F0F7F2",
  },
  title: { fontSize: 16, fontWeight: "600", color: colors.ink },
  preview: { fontSize: 13, color: colors.muted, lineHeight: 18 },
});

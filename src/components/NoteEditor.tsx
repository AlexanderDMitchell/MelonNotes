import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { deleteNote, saveNote } from "@/actions";
import { melon } from "@/database";
import type { NoteModel } from "@/database/tables/Note";
import type { TagModel } from "@/database/tables/Tag";
import { colors, space } from "@/theme";

type Injected = {
  note: NoteModel;
  tags: TagModel[];
};

type Query = {
  noteId: string;
};

type Props = {
  onDeleted: () => void;
};

const enhancer = withObservables(["noteId"], ({ noteId }: Query) => ({
  note: melon.get("notes").findAndObserve(noteId),
  tags: melon.get("tags").query(Q.sortBy("name", Q.asc)).observe(),
}));

function NoteEditorView({ note, tags, onDeleted }: Injected & Props) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tagId, setTagId] = useState(note.tagId);

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setTagId(note.tagId);
  }, [note.id, note.title, note.body, note.tagId]);

  const onSave = () => saveNote(note, { title, body, tagId });

  return (
    <View style={styles.wrap}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        onBlur={onSave}
        placeholder="Title"
        placeholderTextColor={colors.muted}
        style={styles.title}
      />
      <View style={styles.tagRow}>
        <Pressable
          onPress={() => {
            setTagId("");
            saveNote(note, { title, body, tagId: "" });
          }}
          style={[styles.tagChip, tagId === "" && styles.tagChipOn]}
        >
          <Text style={styles.tagText}>no tag</Text>
        </Pressable>
        {tags.map((tag) => (
          <Pressable
            key={tag.id}
            onPress={() => {
              setTagId(tag.id);
              saveNote(note, { title, body, tagId: tag.id });
            }}
            style={[styles.tagChip, tagId === tag.id && styles.tagChipOn]}
          >
            <Text style={styles.tagText}>{tag.name}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={body}
        onChangeText={setBody}
        onBlur={onSave}
        placeholder="Write something…"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.body}
        textAlignVertical="top"
      />
      <View style={styles.actions}>
        <Pressable onPress={onSave} style={styles.primary}>
          <Text style={styles.primaryText}>Save</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            await deleteNote(note.id);
            onDeleted();
          }}
          style={styles.danger}
        >
          <Text style={styles.dangerText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const NoteEditor = melon.enhance<Injected, Query, Props>(
  enhancer,
  NoteEditorView,
);

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0, minWidth: 0, gap: space.md },
  title: {
    flexShrink: 0,
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
    padding: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  body: {
    flex: 1,
    minHeight: 0,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
    padding: space.sm,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    flexShrink: 0,
  },
  tagChip: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.chip,
  },
  tagChipOn: { backgroundColor: "#D9E8DE" },
  tagText: { fontSize: 13, color: colors.ink },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    flexShrink: 0,
  },
  primary: {
    backgroundColor: colors.accent,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: 8,
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  danger: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerText: { color: colors.danger, fontWeight: "600" },
});

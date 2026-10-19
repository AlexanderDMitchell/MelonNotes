import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  createFolder,
  createNote,
  createTag,
  resetDemo,
} from "@/actions";
import { melon } from "@/database";
import { seedIfEmpty } from "@/database/seed";
import { FolderList } from "@/components/FolderList";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteList } from "@/components/NoteList";
import { TagBar } from "@/components/TagBar";
import { colors, space } from "@/theme";

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const available = useSyncExternalStore(
    melon.subscribeDatabaseAvailable,
    melon.getDatabaseAvailable,
    melon.getDatabaseAvailable,
  );

  const [folderId, setFolderId] = useState<string | null>(null);
  const [tagId, setTagId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!available) return;
    let cancelled = false;
    (async () => {
      await seedIfEmpty();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [available]);

  // Pick first folder once seed lands
  useEffect(() => {
    if (!ready || folderId) return;
    melon
      .get("folders")
      .query()
      .fetch()
      .then((folders) => {
        if (folders[0]) setFolderId(folders[0].id);
      });
  }, [ready, folderId]);

  if (!available || !ready) {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootText}>Loading MelonDB…</Text>
      </View>
    );
  }

  const onNewNote = async () => {
    if (!folderId) return;
    const id = await createNote(folderId, tagId ?? "");
    setNoteId(id);
  };

  const onAddFolder = async () => {
    if (!folderDraft.trim()) return;
    const id = await createFolder(folderDraft);
    setFolderDraft("");
    setFolderId(id);
  };

  const onAddTag = async () => {
    if (!tagDraft.trim()) return;
    await createTag(tagDraft);
    setTagDraft("");
  };

  const onReset = async () => {
    setNoteId(null);
    setFolderId(null);
    setTagId(null);
    setReady(false);
    await resetDemo();
    await seedIfEmpty();
    setReady(true);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Melon Notes</Text>
          <Text style={styles.sub}>
            Minimal demo of @alexmitchell/melondb — folders, tags, notes
          </Text>
        </View>
        <Pressable onPress={onReset} style={styles.reset}>
          <Text style={styles.resetText}>Reset DB</Text>
        </Pressable>
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={[styles.sidebar, wide && styles.sidebarWide]}>
          <FolderList selectedFolderId={folderId} onSelect={setFolderId} />
          <View style={styles.inlineForm}>
            <TextInput
              value={folderDraft}
              onChangeText={setFolderDraft}
              placeholder="New folder"
              placeholderTextColor={colors.muted}
              style={styles.input}
              onSubmitEditing={onAddFolder}
            />
            <Pressable onPress={onAddFolder} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Add</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Tags</Text>
          <TagBar selectedTagId={tagId} onSelect={setTagId} />
          <View style={styles.inlineForm}>
            <TextInput
              value={tagDraft}
              onChangeText={setTagDraft}
              placeholder="New tag"
              placeholderTextColor={colors.muted}
              style={styles.input}
              onSubmitEditing={onAddTag}
            />
            <Pressable onPress={onAddTag} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Add</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.listPane}
          contentContainerStyle={styles.listContent}
        >
          <View style={styles.listHeader}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Pressable onPress={onNewNote} style={styles.primary}>
              <Text style={styles.primaryText}>New note</Text>
            </Pressable>
          </View>
          <NoteList
            folderId={folderId}
            tagId={tagId}
            selectedNoteId={noteId}
            onSelect={setNoteId}
          />
        </ScrollView>

        <View style={[styles.editor, wide && styles.editorWide]}>
          {noteId ? (
            <NoteEditor noteId={noteId} onDeleted={() => setNoteId(null)} />
          ) : (
            <View style={styles.editorEmpty}>
              <Text style={styles.editorEmptyText}>Select a note to edit</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  bootText: { color: colors.muted },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: space.lg,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
    maxWidth: 420,
  },
  reset: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  resetText: { color: colors.muted, fontSize: 13 },
  body: {
    flex: 1,
    padding: space.lg,
    gap: space.lg,
  },
  bodyWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  sidebar: {
    gap: space.md,
    padding: space.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sidebarWide: {
    width: 240,
    flexShrink: 0,
  },
  listPane: {
    flex: 1,
    minHeight: 220,
  },
  listContent: {
    gap: space.md,
    paddingBottom: space.xl,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editor: {
    flex: 1,
    minHeight: 280,
    padding: space.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  editorWide: {
    maxWidth: 480,
  },
  editorEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editorEmptyText: { color: colors.muted },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  inlineForm: {
    flexDirection: "row",
    gap: space.sm,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  smallBtn: {
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.chip,
  },
  smallBtnText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  primary: {
    backgroundColor: colors.accent,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});

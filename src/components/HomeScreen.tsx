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
import { createFolder, createNote, createTag, resetDemo } from "@/actions";
import { melon } from "@/database";
import { seedIfEmpty } from "@/database/seed";
import { FolderList } from "@/components/FolderList";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteList } from "@/components/NoteList";
import { TagBar } from "@/components/TagBar";
import { colors, space } from "@/theme";

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 960;

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

  // Narrow: list OR editor (not both stacked — that was overflowing)
  const showList = wide || !noteId;
  const showEditor = wide || !!noteId;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.brand} numberOfLines={1}>
            Melon Notes
          </Text>
          <Text style={styles.sub} numberOfLines={2}>
            Minimal demo of @alexmitchell/melondb — folders, tags, notes
          </Text>
        </View>
        <Pressable onPress={onReset} style={styles.reset}>
          <Text style={styles.resetText}>Reset DB</Text>
        </Pressable>
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <ScrollView
          style={[
            styles.sidebar,
            wide ? styles.sidebarWide : styles.sidebarNarrow,
          ]}
          contentContainerStyle={styles.sidebarContent}
          keyboardShouldPersistTaps="handled"
        >
          <FolderList
            selectedFolderId={folderId}
            onSelect={(id) => {
              setFolderId(id);
              if (!wide) setNoteId(null);
            }}
          />
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
        </ScrollView>

        {showList && (
          <View style={[styles.pane, styles.listPane]}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>Notes</Text>
              <Pressable onPress={onNewNote} style={styles.primary}>
                <Text style={styles.primaryText}>New note</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
              <NoteList
                folderId={folderId}
                tagId={tagId}
                selectedNoteId={noteId}
                onSelect={setNoteId}
              />
            </ScrollView>
          </View>
        )}

        {showEditor && (
          <View style={[styles.pane, styles.editorPane]}>
            {!wide && noteId ? (
              <Pressable onPress={() => setNoteId(null)} style={styles.backRow}>
                <Text style={styles.backText}>← Notes</Text>
              </Pressable>
            ) : null}
            {noteId ? (
              <NoteEditor noteId={noteId} onDeleted={() => setNoteId(null)} />
            ) : (
              <View style={styles.editorEmpty}>
                <Text style={styles.editorEmptyText}>
                  Select a note to edit
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  bootText: { color: colors.muted },
  header: {
    flexShrink: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: space.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  reset: {
    flexShrink: 0,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  resetText: { color: colors.muted, fontSize: 13 },
  body: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    padding: space.md,
    gap: space.md,
    overflow: "hidden",
  },
  bodyWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  sidebar: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  sidebarNarrow: {
    flexGrow: 0,
    flexShrink: 0,
  },
  sidebarWide: {
    width: 220,
    alignSelf: "stretch",
  },
  sidebarContent: {
    padding: space.md,
    gap: space.md,
  },
  pane: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    overflow: "hidden",
  },
  listPane: {
    gap: space.md,
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    gap: space.sm,
    paddingBottom: space.md,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    gap: space.sm,
  },
  editorPane: {
    // slightly prefer editor width on wide screens
  },
  editorEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editorEmptyText: { color: colors.muted },
  backRow: {
    marginBottom: space.sm,
    alignSelf: "flex-start",
  },
  backText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  inlineForm: {
    flexDirection: "row",
    gap: space.md,
    alignItems: "center",
    width: "100%",
    minWidth: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 36,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: space.sm,
    paddingVertical: 0,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  smallBtn: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: space.md,
    borderRadius: 8,
    backgroundColor: colors.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  primary: {
    flexShrink: 0,
    backgroundColor: colors.accent,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});

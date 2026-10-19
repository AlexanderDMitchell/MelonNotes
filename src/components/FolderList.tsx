import { Pressable, StyleSheet, Text, View } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { melon } from "@/database";
import type { FolderModel } from "@/database/tables/Folder";
import { colors, space } from "@/theme";

type Injected = {
  folders: FolderModel[];
};

type Props = {
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
};

const enhancer = withObservables([], () => ({
  folders: melon
    .get("folders")
    .query(Q.sortBy("created_date", Q.asc))
    .observe(),
}));

function FolderListView({ folders, selectedFolderId, onSelect }: Injected & Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Folders</Text>
      {folders.map((folder) => {
        const selected = folder.id === selectedFolderId;
        return (
          <Pressable
            key={folder.id}
            onPress={() => onSelect(folder.id)}
            style={[styles.row, selected && styles.rowSelected]}
          >
            <View style={[styles.dot, { backgroundColor: folder.color }]} />
            <Text style={[styles.name, selected && styles.nameSelected]}>
              {folder.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const FolderList = melon.enhance<Injected, unknown, Props>(
  enhancer,
  FolderListView,
);

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  label: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 8,
  },
  rowSelected: { backgroundColor: colors.chip },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 15, color: colors.ink },
  nameSelected: { fontWeight: "600" },
});

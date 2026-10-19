import { Pressable, StyleSheet, Text, View } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Q } from "@nozbe/watermelondb";
import { melon } from "@/database";
import type { TagModel } from "@/database/tables/Tag";
import { colors, space } from "@/theme";

type Injected = {
  tags: TagModel[];
};

type Props = {
  selectedTagId: string | null;
  onSelect: (id: string | null) => void;
};

const enhancer = withObservables([], () => ({
  tags: melon.get("tags").query(Q.sortBy("name", Q.asc)).observe(),
}));

function TagBarView({ tags, selectedTagId, onSelect }: Injected & Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, selectedTagId === null && styles.chipOn]}
      >
        <Text style={styles.chipText}>all tags</Text>
      </Pressable>
      {tags.map((tag) => {
        const on = tag.id === selectedTagId;
        return (
          <Pressable
            key={tag.id}
            onPress={() => onSelect(on ? null : tag.id)}
            style={[styles.chip, on && styles.chipOn]}
          >
            <View style={[styles.dot, { backgroundColor: tag.color }]} />
            <Text style={styles.chipText}>{tag.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const TagBar = melon.enhance<Injected, unknown, Props>(
  enhancer,
  TagBarView,
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.chip,
  },
  chipOn: {
    backgroundColor: "#D9E8DE",
  },
  chipText: { fontSize: 13, color: colors.ink },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

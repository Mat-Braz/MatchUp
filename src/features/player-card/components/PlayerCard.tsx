import { Image, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

import type {
  CardBackground,
  CardShape,
  PlayerCardAttributes,
} from "../economy";
import { CARD_ATTRIBUTE_KEYS, CARD_ATTRIBUTE_SHORT } from "../economy";
import { CardBackgroundLayer } from "./CardBackgroundLayer";
import { CrestCardFrame } from "./CrestCardFrame";

type Props = {
  name: string;
  avatarUrl?: string | null;
  overall: number;
  background: CardBackground;
  shape?: CardShape;
  attributes: PlayerCardAttributes;
  width?: number;
};

function edgeForBackground(
  background: CardBackground,
  premium: boolean,
): string {
  if (premium) {
    if (background === "PINK") return "#F5D0A9";
    if (background === "GREEN") return "#A5F3FC";
    if (background === "BLACK") return "#F5D76E";
    if (background === "PURPLE") return "#A5F3FC";
    return "#F5E6A3";
  }
  if (background === "BLACK") return "#C9A227";
  if (background === "PINK") return "#F9A8D4";
  if (background === "GREEN") return "#67E8F9";
  if (background === "PURPLE") return "#67E8F9";
  return "rgba(255,255,255,0.35)";
}

function CardFace({
  name,
  avatarUrl,
  overall,
  background,
  attributes,
  premium,
  crestFamily,
}: {
  name: string;
  avatarUrl?: string | null;
  overall: number;
  background: CardBackground;
  attributes: PlayerCardAttributes;
  premium: boolean;
  crestFamily: boolean;
}) {
  const leftAttrs = CARD_ATTRIBUTE_KEYS.slice(0, 3);
  const rightAttrs = CARD_ATTRIBUTE_KEYS.slice(3);
  const edge = edgeForBackground(background, premium);

  return (
    <View style={styles.face}>
      <CardBackgroundLayer background={background} crest={crestFamily} />
      <View
        style={[
          styles.content,
          crestFamily && styles.contentCrest,
          premium && styles.contentPremium,
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.ovrBlock}>
            <Text style={[styles.ovrValue, premium && styles.ovrValuePremium]}>
              {overall}
            </Text>
            <Text style={styles.ovrLabel}>OVR</Text>
          </View>
          <View
            style={[
              styles.photoWrap,
              crestFamily && styles.photoWrapCrest,
              premium && { borderColor: edge, borderWidth: 2.5 },
            ]}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitial}>
                  {name.trim().charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {crestFamily ? (
          <View style={styles.nameBarCrest}>
            <Text style={[styles.name, styles.nameCrest]} numberOfLines={1}>
              {name}
            </Text>
          </View>
        ) : (
          <Text
            style={[styles.name, premium && styles.namePremium]}
            numberOfLines={1}
          >
            {name}
          </Text>
        )}

        {crestFamily ? (
          <View style={styles.futAttrs}>
            <View style={styles.futCol}>
              {leftAttrs.map((key) => (
                <View key={key} style={styles.futLine}>
                  <Text style={styles.futValue}>{attributes[key]}</Text>
                  <Text style={styles.futLabel}>
                    {CARD_ATTRIBUTE_SHORT[key]}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.futDivider} />
            <View style={styles.futCol}>
              {rightAttrs.map((key) => (
                <View key={key} style={styles.futLine}>
                  <Text style={styles.futValue}>{attributes[key]}</Text>
                  <Text style={styles.futLabel}>
                    {CARD_ATTRIBUTE_SHORT[key]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.attrsRow}>
            <View style={styles.attrsCol}>
              {leftAttrs.map((key) => (
                <View key={key} style={styles.attrLine}>
                  <Text style={styles.attrLabel}>
                    {CARD_ATTRIBUTE_SHORT[key]}
                  </Text>
                  <Text style={styles.attrValue}>{attributes[key]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.attrsDivider} />
            <View style={styles.attrsCol}>
              {rightAttrs.map((key) => (
                <View key={key} style={styles.attrLine}>
                  <Text style={styles.attrLabel}>
                    {CARD_ATTRIBUTE_SHORT[key]}
                  </Text>
                  <Text style={styles.attrValue}>{attributes[key]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export function PlayerCard({
  name,
  avatarUrl,
  overall,
  background,
  shape = "SQUARE",
  attributes,
  width = 240,
}: Props) {
  const safeAttributes = attributes ?? {
    pace: 52,
    shooting: 52,
    passing: 52,
    dribbling: 52,
    defense: 52,
    physical: 52,
  };
  const resolvedShape = shape === "SHIELD" ? "SQUARE" : (shape ?? "SQUARE");
  const isCrest = resolvedShape === "CREST";
  // Mesma altura pros dois formatos; um pouco maior pra o Crest caber inteiro
  const height = Math.round(width * 1.52);
  const edge = edgeForBackground(background, isCrest);

  if (isCrest) {
    return (
      <CrestCardFrame
        width={width}
        height={height}
        edgeColor={edge}
        premium
      >
        <CardFace
          name={name}
          avatarUrl={avatarUrl}
          overall={overall}
          background={background}
          attributes={safeAttributes}
          premium
          crestFamily
        />
      </CrestCardFrame>
    );
  }

  return (
    <View
      style={[
        styles.squareShell,
        {
          width,
          height,
          borderColor: edge,
        },
      ]}
    >
      <CardFace
        name={name}
        avatarUrl={avatarUrl}
        overall={overall}
        background={background}
        attributes={safeAttributes}
        premium={false}
        crestFamily={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  squareShell: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    justifyContent: "space-between",
    zIndex: 2,
  },
  contentCrest: {
    paddingTop: 38,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  contentPremium: {
    paddingTop: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  ovrBlock: {
    alignItems: "center",
    minWidth: 48,
    paddingTop: 4,
  },
  ovrValue: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: theme.fontWeights.black,
    lineHeight: 38,
  },
  ovrValuePremium: {
    fontSize: 34,
  },
  ovrLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: 1,
  },
  photoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  photoWrapCrest: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: theme.fontWeights.bold,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  nameCrest: {
    marginTop: 0,
    letterSpacing: 1.6,
    fontSize: 15,
  },
  nameBarCrest: {
    marginTop: 6,
    marginBottom: 4,
    marginHorizontal: -4,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
  },
  namePremium: {
    letterSpacing: 1.2,
    fontSize: 17,
  },
  attrsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  attrsCol: {
    flex: 1,
  },
  attrsDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 10,
  },
  attrLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  attrLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: theme.fontWeights.semibold,
    letterSpacing: 0.6,
  },
  attrValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
  },
  /** Layout estilo FUT: "99 VEL" em duas colunas (só Crest). */
  futAttrs: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  futCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  futDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginHorizontal: 10,
    alignSelf: "stretch",
  },
  futLine: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 5,
    minWidth: 64,
  },
  futValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: theme.fontWeights.black,
    fontVariant: ["tabular-nums"],
  },
  futLabel: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: 0.8,
  },
});

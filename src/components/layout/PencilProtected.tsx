import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';

import { PencilScreen } from '@/features/auth';
import { theme } from '@/constants/theme';

const fullLogo = require('../../../assets/images/RgTnC.png') as ImageSourcePropType;
const emptyKickingBall = require('../../../assets/images/kicking-ball.png') as ImageSourcePropType;
const navIcons = {
  home: {
    active: require('../../../assets/images/qNUyM.png') as ImageSourcePropType,
    inactive: require('../../../assets/images/VgFMf.png') as ImageSourcePropType,
  },
  search: {
    active: require('../../../assets/images/t8Y3Sx.png') as ImageSourcePropType,
    inactive: require('../../../assets/images/s4JsgM.png') as ImageSourcePropType,
  },
  chat: {
    active: require('../../../assets/images/T3MDIN.png') as ImageSourcePropType,
    inactive: require('../../../assets/images/nQ8Sy.png') as ImageSourcePropType,
  },
  bell: {
    active: require('../../../assets/images/eW62m.png') as ImageSourcePropType,
    inactive: require('../../../assets/images/ATo9T.png') as ImageSourcePropType,
  },
  user: {
    active: require('../../../assets/images/aFObI.png') as ImageSourcePropType,
    inactive: require('../../../assets/images/F6dcW.png') as ImageSourcePropType,
  },
} as const;

type TabName = 'Início' | 'Explorar' | 'Times' | 'Chat' | 'Notificações' | 'Perfil';
type NavIconName = keyof typeof navIcons;

export function ProtectedCanvas({
  children,
  active,
  scroll = false,
  canvasHeight = 844,
}: {
  children: React.ReactNode;
  active: TabName;
  scroll?: boolean;
  canvasHeight?: number;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.protectedRoot}>
      <View style={styles.protectedContent}>
        <PencilScreen scroll={scroll} canvasHeight={canvasHeight}>
          {children}
        </PencilScreen>
      </View>
      <View
        style={[
          styles.fixedNavBar,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <BottomNav active={active} />
      </View>
    </View>
  );
}

export function MatchUpLogoHeader() {
  return (
    <View style={styles.logoWrap}>
      <Image source={fullLogo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.logoSubtitle}>Seus campeonatos em um só lugar</Text>
    </View>
  );
}

export function ScreenTitle({ children, action }: { children: string; action?: string }) {
  return (
    <View style={styles.titleRow}>
      <Text style={styles.screenTitle}>{children}</Text>
      {action ? (
        <View style={styles.roundAction}>
          <Text style={styles.roundActionIcon}>+</Text>
        </View>
      ) : null}
    </View>
  );
}

export function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <View style={styles.searchBox}>
      <Image source={navIcons.search.inactive} style={styles.searchIconImage} resizeMode="contain" />
      <Text style={styles.searchPlaceholder}>{placeholder}</Text>
    </View>
  );
}

export function EmptyState({ top, title, message }: { top: number; title: string; message: string }) {
  return (
    <View style={[styles.emptyState, { top }]}> 
      <View style={styles.emptyIconBall}>
        <Image source={emptyKickingBall} style={styles.emptyKickingBall} resizeMode="contain" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

export function Chips({ items, top }: { items: string[]; top: number }) {
  return (
    <View style={[styles.chips, { top }]}>
      {items.map((item, index) => (
        <View key={item} style={[styles.chip, index === 0 && styles.chipActive]}>
          <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ChampionshipCard({
  top,
  title,
  status = 'Inscrições abertas',
  year,
  dates,
  teams = '0 times',
  actionLabel,
  onPress,
}: {
  top: number;
  title: string;
  status?: string;
  year?: string;
  dates?: string;
  teams?: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.champCard,
        { top },
        pressed && onPress ? { opacity: 0.9 } : null,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.cardStatus}>{status}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{year ?? '—'}</Text>
      <Text style={styles.cardDates}>{dates ?? 'Datas a definir'}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTeams}>{teams}</Text>
        {actionLabel ? (
          <View style={styles.smallButton}>
            <Text style={styles.smallButtonText}>{actionLabel}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function SectionLabel({
  top,
  children,
  action,
  onActionPress,
}: {
  top: number;
  children: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={[styles.sectionRow, { top }]}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? (
        <Pressable style={styles.sectionActionButton} onPress={onActionPress}>
          <Text style={styles.sectionActionButtonText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ContactRow({ top, name, meta, time, active = false }: { top: number; name: string; meta: string; time: string; active?: boolean }) {
  return (
    <View style={[styles.contactRow, { top }]}>
      <View style={[styles.contactAvatar, active && styles.contactAvatarActive]}><Text style={styles.contactAvatarText}>{active ? '♙' : '◌'}</Text></View>
      <View style={styles.contactCopy}>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.contactMeta}>{meta}</Text>
        {active ? <Text style={styles.contactBadge}>Aprovado</Text> : null}
      </View>
      <Text style={[styles.contactTime, active && styles.contactTimeActive]}>{time}</Text>
    </View>
  );
}

export function NotificationRow({ top, title, message, meta, active = false }: { top: number; title: string; message: string; meta: string; active?: boolean }) {
  return (
    <View style={[styles.notificationRow, { top }]}>
      <View style={[styles.notificationIcon, active && styles.notificationIconActive]}><Text style={styles.notificationIconText}>{active ? '✓' : '○'}</Text></View>
      <View style={styles.notificationCopy}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationMessage}>{message}</Text>
        <Text style={styles.notificationMeta}>{meta}</Text>
      </View>
      {active ? <View style={styles.notificationDot} /> : null}
    </View>
  );
}

export type ProfileMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress?: () => void;
};

export function ProfileHeader({
  name,
  subtitle,
  avatarUrl,
  onChangePhoto,
}: {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
  onChangePhoto?: () => void;
}) {
  return (
    <View style={styles.profileHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Alterar foto de perfil"
        onPress={onChangePhoto}
        style={styles.avatarPressable}
      >
        <View style={styles.avatarRing}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={42} color={theme.colors.textDim} />
            </View>
          )}
        </View>
        <Text style={styles.changePhotoText}>alterar</Text>
      </Pressable>
      <Text style={styles.profileName}>{name}</Text>
      <Text style={styles.profileSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function ProfileMenu({
  items,
  top = 275,
}: {
  items: ProfileMenuItem[];
  top?: number;
}) {
  return (
    <View style={[styles.profileMenu, { top }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          onPress={item.onPress}
        >
          <View style={[styles.menuIconWrap, item.danger && styles.menuIconWrapDanger]}>
            <Ionicons
              name={item.icon}
              size={18}
              color={item.danger ? theme.colors.dangerSoft : theme.colors.primary}
            />
          </View>
          <Text style={[styles.menuText, item.danger && styles.dangerText]}>{item.label}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={item.danger ? theme.colors.dangerSoft : '#80808A'}
          />
        </Pressable>
      ))}
    </View>
  );
}

function BottomNav({ active }: { active: TabName }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tabs: {
    label: TabName;
    icon?: NavIconName;
    ionicon?: keyof typeof Ionicons.glyphMap;
    route: Href;
  }[] = [
    { label: 'Início', icon: 'home', route: '/(protected)/(tabs)/home' as Href },
    { label: 'Explorar', icon: 'search', route: '/(protected)/(tabs)/explore' as Href },
    {
      label: 'Times',
      ionicon: 'shield-outline',
      route: '/(protected)/(tabs)/teams' as Href,
    },
    { label: 'Chat', icon: 'chat', route: '/(protected)/(tabs)/contacts' as Href },
    {
      label: 'Notificações',
      icon: 'bell',
      route: '/(protected)/(tabs)/notifications' as Href,
    },
    { label: 'Perfil', icon: 'user', route: '/(protected)/(tabs)/profile' as Href },
  ];

  return (
    <View style={[styles.bottomNav, { width: Math.min(width - 20, 370) }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.label;
        return (
          <Pressable
            key={tab.label}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => router.push(tab.route)}
          >
            {tab.ionicon ? (
              <Ionicons
                name={tab.ionicon}
                size={20}
                color={isActive ? theme.colors.primary : '#80808A'}
              />
            ) : tab.icon ? (
              <Image
                source={navIcons[tab.icon][isActive ? 'active' : 'inactive']}
                style={styles.navIconImage}
                resizeMode="contain"
              />
            ) : null}
            <Text style={[styles.navLabel, isActive && styles.navActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  protectedRoot: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  protectedContent: {
    flex: 1,
  },
  fixedNavBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  logoWrap: {
    position: 'absolute',
    left: 24,
    top: 52,
    width: 200,
    height: 64,
  },
  logo: {
    width: 156,
    height: 44,
  },
  logoSubtitle: {
    position: 'absolute',
    left: 57,
    top: 39,
    color: '#B9CCAF',
    fontSize: 10,
    fontWeight: '600',
  },
  titleRow: {
    position: 'absolute',
    left: 24,
    top: 63,
    width: 342,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.extraBold,
  },
  roundAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  roundActionIcon: {
    color: theme.colors.black,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 32,
  },
  searchBox: {
    position: 'absolute',
    left: 24,
    top: 115,
    width: 342,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 14,
  },
  searchPlaceholder: {
    color: '#80808A',
    fontSize: 14,
    fontWeight: '600',
  },
  searchIconImage: {
    width: 16,
    height: 16,
  },
  emptyState: {
    position: 'absolute',
    left: 24,
    width: 342,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    padding: 24,
    gap: 12,
  },
  emptyIconBall: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: theme.colors.surfaceLow,
  },
  emptyKickingBall: {
    width: 76,
    height: 76,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#A6A5B0',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'center',
  },
  chips: {
    position: 'absolute',
    left: 24,
    width: 342,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 29,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: theme.fontWeights.extraBold,
  },
  chipTextActive: {
    color: theme.colors.black,
  },
  champCard: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 150,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: theme.fontWeights.extraBold,
  },
  cardStatus: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: theme.fontWeights.extraBold,
  },
  cardSubtitle: {
    marginTop: 2,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  cardDates: {
    marginTop: 9,
    color: '#A6A5B0',
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTeams: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: theme.fontWeights.extraBold,
  },
  smallButton: {
    height: 26,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
  },
  smallButtonText: {
    color: theme.colors.black,
    fontSize: 9,
    fontWeight: theme.fontWeights.extraBold,
  },
  sectionRow: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
  },
  sectionActionButton: {
    minWidth: 72,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
  },
  sectionActionButtonText: {
    color: theme.colors.black,
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
  },
  contactRow: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceCard,
  },
  contactAvatarActive: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  contactAvatarText: {
    color: theme.colors.primary,
    fontSize: 18,
  },
  contactCopy: {
    flex: 1,
  },
  contactName: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.fontWeights.extraBold,
  },
  contactMeta: {
    color: '#A6A5B0',
    fontSize: 10,
    fontWeight: '600',
  },
  contactBadge: {
    alignSelf: 'flex-start',
    marginTop: 3,
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: theme.fontWeights.extraBold,
  },
  contactTime: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
  },
  contactTimeActive: {
    color: theme.colors.primary,
  },
  notificationRow: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 16,
  },
  notificationIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: theme.colors.surfaceHigh,
  },
  notificationIconActive: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  notificationIconText: {
    color: theme.colors.primary,
    fontSize: 18,
  },
  notificationCopy: {
    flex: 1,
    gap: 2,
  },
  notificationTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.fontWeights.extraBold,
  },
  notificationMessage: {
    color: '#A6A5B0',
    fontSize: 9.5,
    fontWeight: '600',
  },
  notificationMeta: {
    color: '#A6A5B0',
    fontSize: 9,
    fontWeight: theme.fontWeights.bold,
  },
  notificationDot: {
    position: 'absolute',
    right: 24,
    top: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  profileHeader: {
    position: 'absolute',
    left: 24,
    top: 96,
    width: 342,
    alignItems: 'center',
  },
  avatarPressable: {
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceCard,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceLow,
  },
  changePhotoText: {
    color: theme.colors.primarySoft,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  profileName: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  profileSubtitle: {
    marginTop: 4,
    color: '#A6A5B0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileMenu: {
    position: 'absolute',
    left: 24,
    top: 275,
    width: 342,
    gap: 10,
  },
  menuItem: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuItemPressed: {
    opacity: 0.85,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceLow,
  },
  menuIconWrapDanger: {
    backgroundColor: theme.colors.dangerDark,
  },
  menuText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
  },
  dangerText: {
    color: theme.colors.dangerSoft,
  },
  bottomNav: {
    height: 78,
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceLow,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 2,
    paddingHorizontal: 2,
  },
  navItemActive: {
    backgroundColor: theme.colors.surfaceHigh,
  },
  navIconImage: {
    width: 20,
    height: 20,
  },
  navLabel: {
    color: theme.colors.textDim,
    fontSize: 9,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 12,
  },
  navActive: {
    color: theme.colors.primary,
  },
});

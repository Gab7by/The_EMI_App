import { Gift, GraduationCap, House, Library, Podcast } from "lucide-react-native"
import { StyleSheet } from "react-native"
import { Colors } from "./theme"

export const ICONS = {
    index: House,
    library: Library,
    discipleship: GraduationCap,
    giving: Gift,
    podcast: Podcast
}

export const LABELS = {
    index: "Home",
    library: "Library",
    discipleship: "Discipleship",
    giving: "Giving",
    podcast: "Podcast"
}

export const ACTIVE_COLOR = "#014421"

export const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#102B18',
    borderRadius: 28,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tabButtonInactive: {
    width: 50,
    height: 52,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  tabButtonActive: {
    flex: 1,
    height: 52,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.menorah.primary,
    shadowColor: Colors.menorah.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 10
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#014421',
    overflow: 'hidden',
  },
})

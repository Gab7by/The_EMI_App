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
    backgroundColor: Colors.menorah.darkGreen,
    borderRadius: 32,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabButtonInactive: {
    width: 50,
    height: 50,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  tabButtonActive: {
    flex: 1,
    height: 50,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.menorah.primary
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 10
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#014421',
    overflow: 'hidden',
  },
})
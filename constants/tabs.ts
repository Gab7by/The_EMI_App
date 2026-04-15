import { House, Podcast } from "lucide-react-native"
import { StyleSheet } from "react-native"
import { Colors } from "./theme"

export const ICONS = {
    index: House,
    podcast: Podcast
}

export const LABELS = {
    index: "Home",
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
    alignItems: 'center'
  },
  tabButton : {
    flex: 1,
    height: 60,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: "center"
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: "center"
  },
  tabActive: {
    backgroundColor: Colors.menorah.primary
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    overflow: 'hidden',
  },
})

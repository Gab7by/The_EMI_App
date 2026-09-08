import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react-native"

export type ContactItem = {
  id: string
  label: string
  value: string
  /** What tapping the row opens - mailto:/tel:/https link, as appropriate. */
  url: string
  icon: LucideIcon
}

export const CONTACT_ITEMS: ContactItem[] = [
  {
    id: "email",
    label: "Email",
    value: "sethowusuministries@gmail.com",
    url: "mailto:sethowusuministries@gmail.com",
    icon: Mail,
  },
  {
    id: "phone",
    label: "Phone",
    value: "0537 023 737",
    url: "tel:0537023737",
    icon: Phone,
  },
  {
    id: "location",
    label: "Location",
    value: "Cape Coast, UCC campus, Ayensu (near Ayensu Round Palace)",
    url: "https://maps.app.goo.gl/fYHpPEWXScyPbqD66?g_st=ic",
    icon: MapPin,
  },
]

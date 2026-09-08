import { BIBLE_BOOKS, getBibleBook, type BibleBook } from "./books"

export * from "./books"

// Both bundled, self-hosted, public-domain translations - safe to ship
// offline with no ongoing licensing cost. NIV, NKJV and RSV (asked about
// alongside KJV) are all still under active copyright held by their
// respective publishers (Biblica/Zondervan, Thomas Nelson, and the
// National Council of Churches) - none are public domain, so none can be
// bundled this same way; adding one of those would mean either a paid
// license to redistribute the full text, or a live, rate-limited API call
// per chapter instead of a bundled require() below - a real product/cost
// decision, not a code change.
export type BibleTranslationId = "web" | "kjv"

export const DEFAULT_BIBLE_TRANSLATION: BibleTranslationId = "web"

export const BIBLE_TRANSLATIONS: { id: BibleTranslationId; name: string; shortName: string }[] = [
  { id: "web", name: "World English Bible", shortName: "WEB" },
  { id: "kjv", name: "King James Version (1769)", shortName: "KJV" },
]

export const getBibleTranslationName = (translation: BibleTranslationId): string =>
  BIBLE_TRANSLATIONS.find((entry) => entry.id === translation)?.name ?? translation

/** Narrows an arbitrary string (e.g. off a signal payload) to a known
 * translation id, falling back to the default rather than trusting it
 * outright - it's read off the wire, not typed at that point. */
export const parseBibleTranslationId = (value: string | null | undefined): BibleTranslationId =>
  BIBLE_TRANSLATIONS.some((entry) => entry.id === value)
    ? (value as BibleTranslationId)
    : DEFAULT_BIBLE_TRANSLATION

type BundledBibleData = {
  translation: string
  translationName: string
  books: { id: string; chapters: string[][] }[]
}

const BUNDLED_DATA_LOADERS: Record<BibleTranslationId, () => BundledBibleData> = {
  web: () => require("./data/web.json"),
  kjv: () => require("./data/kjv.json"),
}

const cache = new Map<BibleTranslationId, BundledBibleData>()

// Deferred require - each translation's multi-MB dataset is only parsed
// the first time one of its chapters is actually opened (and only for
// that translation), not at app startup or while just browsing the book
// list (lib/bible/books.ts is a tiny static array, safe to import
// anywhere).
const loadBundledData = (translation: BibleTranslationId): BundledBibleData => {
  const cached = cache.get(translation)
  if (cached) return cached

  const data = BUNDLED_DATA_LOADERS[translation]()
  cache.set(translation, data)
  return data
}

/** Returns the verse text array for a chapter (index 0 = verse 1), or [] if the book/chapter doesn't exist. */
export const getBibleChapterVerses = (
  bookId: string,
  chapter: number,
  translation: BibleTranslationId = DEFAULT_BIBLE_TRANSLATION
): string[] => {
  const book = getBibleBook(bookId)
  if (!book || chapter < 1 || chapter > book.chapterCount) return []

  const data = loadBundledData(translation)
  const bookData = data.books.find((entry) => entry.id === bookId)
  return bookData?.chapters[chapter - 1] ?? []
}

export const searchBibleBooks = (query: string): BibleBook[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return BIBLE_BOOKS

  return BIBLE_BOOKS.filter((book) => book.name.toLowerCase().includes(normalized))
}

import { BIBLE_BOOKS, getBibleBook, type BibleBook } from "./books"

export * from "./books"

// Only one bundled, self-hosted translation for now (World English Bible -
// public domain, freely redistributable). A future copyrighted translation
// (NIV/ESV/etc.) would need a live, licensed API call instead of a bundled
// require() below - see the "Bible feature" writeup for why.
export type BibleTranslationId = "web"

export const DEFAULT_BIBLE_TRANSLATION: BibleTranslationId = "web"

type BundledBibleData = {
  translation: string
  translationName: string
  books: { id: string; chapters: string[][] }[]
}

let cachedData: BundledBibleData | null = null

// Deferred require - the ~4MB dataset is only parsed the first time a
// chapter is actually opened, not at app startup or while just browsing the
// book list (lib/bible/books.ts is a tiny static array, safe to import
// anywhere).
const loadBundledData = (): BundledBibleData => {
  if (!cachedData) {
    cachedData = require("./data/web.json") as BundledBibleData
  }
  return cachedData
}

/** Returns the verse text array for a chapter (index 0 = verse 1), or [] if the book/chapter doesn't exist. */
export const getBibleChapterVerses = (bookId: string, chapter: number): string[] => {
  const book = getBibleBook(bookId)
  if (!book || chapter < 1 || chapter > book.chapterCount) return []

  const data = loadBundledData()
  const bookData = data.books.find((entry) => entry.id === bookId)
  return bookData?.chapters[chapter - 1] ?? []
}

export const searchBibleBooks = (query: string): BibleBook[] => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return BIBLE_BOOKS

  return BIBLE_BOOKS.filter((book) => book.name.toLowerCase().includes(normalized))
}

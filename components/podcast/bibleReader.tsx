import { hapticLight, hapticMedium } from "@/lib/haptics";
import {
  getBibleBook,
  getBibleChapterVerses,
  searchBibleBooks,
  type BibleBook,
} from "@/lib/bible";
import { FlashList } from "@shopify/flash-list";
import { ChevronLeft, ChevronRight, Minus, Plus, Search, Share2, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 17;

type BibleReaderView = "books" | "chapters" | "reader";

export type BibleReaderProps = {
  visible: boolean;
  onClose: () => void;
  /** Currently open book/chapter - lifted to the screen so an incoming host signal can drive it. */
  bookId: string | null;
  chapter: number | null;
  onNavigate: (bookId: string, chapter: number) => void;
  /** Only hosts get the "share with everyone" control. */
  isHost: boolean;
  onShare?: (bookId: string, chapter: number) => void;
};

export const BibleReader = ({
  visible,
  onClose,
  bookId,
  chapter,
  onNavigate,
  isHost,
  onShare,
}: BibleReaderProps) => {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<BibleReaderView>(bookId && chapter ? "reader" : "books");
  const [pickerBookId, setPickerBookId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const book = bookId ? getBibleBook(bookId) : undefined;

  // bookId/chapter can change from outside (a host's BIBLE_NAVIGATE signal
  // updates them on the parent screen) after this component has already
  // mounted with the picker showing - a plain useState initializer only
  // reads them once at mount, so without this the reader would silently
  // stay on the book list instead of jumping to what the host shared.
  const lastAppliedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!bookId || !chapter) return;
    const key = `${bookId}:${chapter}`;
    if (lastAppliedRef.current === key) return;
    lastAppliedRef.current = key;
    setView("reader");
  }, [bookId, chapter]);

  const openBookList = useCallback(() => {
    setSearch("");
    setView("books");
  }, []);

  const openChapterGrid = useCallback((selectedBookId: string) => {
    setPickerBookId(selectedBookId);
    setView("chapters");
  }, []);

  const handleSelectChapter = useCallback(
    (selectedBookId: string, selectedChapter: number) => {
      hapticLight();
      onNavigate(selectedBookId, selectedChapter);
      setView("reader");
    },
    [onNavigate]
  );

  const handleClose = useCallback(() => {
    setView(bookId && chapter ? "reader" : "books");
    onClose();
  }, [bookId, chapter, onClose]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View className="flex-1 bg-menorah-bg" style={{ paddingTop: insets.top }}>
        {view === "books" && (
          <BookListStep
            search={search}
            onSearchChange={setSearch}
            onSelectBook={openChapterGrid}
            onClose={handleClose}
          />
        )}

        {view === "chapters" && pickerBookId && (
          <ChapterGridStep
            book={getBibleBook(pickerBookId)}
            onSelectChapter={(selectedChapter) => handleSelectChapter(pickerBookId, selectedChapter)}
            onBack={openBookList}
            onClose={handleClose}
          />
        )}

        {view === "reader" && book && chapter && (
          <ChapterReaderStep
            book={book}
            chapter={chapter}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isHost={isHost}
            onShare={onShare ? () => onShare(book.id, chapter) : undefined}
            onBrowse={openBookList}
            onPrevChapter={
              chapter > 1 ? () => handleSelectChapter(book.id, chapter - 1) : undefined
            }
            onNextChapter={
              chapter < book.chapterCount ? () => handleSelectChapter(book.id, chapter + 1) : undefined
            }
            onClose={handleClose}
          />
        )}
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Step 1: pick a book
// ─────────────────────────────────────────────────────────────────────
const BookListStep = ({
  search,
  onSearchChange,
  onSelectBook,
  onClose,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onSelectBook: (bookId: string) => void;
  onClose: () => void;
}) => {
  const results = useMemo(() => searchBibleBooks(search), [search]);
  const oldTestament = useMemo(() => results.filter((b) => b.testament === "OT"), [results]);
  const newTestament = useMemo(() => results.filter((b) => b.testament === "NT"), [results]);

  type Row = { type: "header"; label: string } | { type: "book"; book: BibleBook };
  const rows: Row[] = useMemo(
    () => [
      ...(oldTestament.length ? [{ type: "header" as const, label: "Old Testament" }, ...oldTestament.map((book) => ({ type: "book" as const, book }))] : []),
      ...(newTestament.length ? [{ type: "header" as const, label: "New Testament" }, ...newTestament.map((book) => ({ type: "book" as const, book }))] : []),
    ],
    [oldTestament, newTestament]
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-5 pt-3">
        <Text className="text-[18px] font-semibold text-[#F4F5F0]">Bible</Text>
        <Pressable onPress={onClose} hitSlop={12} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <X size={18} color="#F4F5F0" />
        </Pressable>
      </View>

      <View className="mx-5 mt-4 flex-row items-center rounded-[14px] border border-white/10 bg-white/5 px-3 py-2.5">
        <Search size={16} color="#95A89C" />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search books"
          placeholderTextColor="#95A89C"
          className="ml-2 flex-1 text-[14px] text-[#F4F5F0]"
          autoCorrect={false}
        />
      </View>

      <FlashList
        data={rows}
        keyExtractor={(item, index) => (item.type === "header" ? `h-${item.label}` : item.book.id) + index}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <Text className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-[1px] text-[#D7FF00]">
              {item.label}
            </Text>
          ) : (
            <Pressable
              onPress={() => {
                hapticLight();
                onSelectBook(item.book.id);
              }}
              className="mb-2 flex-row items-center justify-between rounded-[14px] bg-white/5 px-4 py-3.5"
            >
              <Text className="text-[15px] text-[#F4F5F0]">{item.book.name}</Text>
              <ChevronRight size={18} color="#95A89C" />
            </Pressable>
          )
        }
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Step 2: pick a chapter
// ─────────────────────────────────────────────────────────────────────
const ChapterGridStep = ({
  book,
  onSelectChapter,
  onBack,
  onClose,
}: {
  book: BibleBook | undefined;
  onSelectChapter: (chapter: number) => void;
  onBack: () => void;
  onClose: () => void;
}) => {
  const chapters = useMemo(() => Array.from({ length: book?.chapterCount ?? 0 }, (_, i) => i + 1), [book]);

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-5 pt-3">
        <Pressable onPress={onBack} hitSlop={12} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <ChevronLeft size={20} color="#F4F5F0" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-[#F4F5F0]">{book?.name}</Text>
        <Pressable onPress={onClose} hitSlop={12} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <X size={18} color="#F4F5F0" />
        </Pressable>
      </View>

      <FlashList
        data={chapters}
        numColumns={5}
        keyExtractor={(item) => String(item)}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelectChapter(item)}
            className="m-1.5 aspect-square flex-1 items-center justify-center rounded-[12px] bg-white/5"
          >
            <Text className="text-[15px] font-medium text-[#F4F5F0]">{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Step 3: read the chapter
// ─────────────────────────────────────────────────────────────────────
const ChapterReaderStep = ({
  book,
  chapter,
  fontSize,
  onFontSizeChange,
  isHost,
  onShare,
  onBrowse,
  onPrevChapter,
  onNextChapter,
  onClose,
}: {
  book: BibleBook;
  chapter: number;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isHost: boolean;
  onShare?: () => void;
  onBrowse: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onClose: () => void;
}) => {
  const verses = useMemo(() => getBibleChapterVerses(book.id, chapter), [book.id, chapter]);
  const [shared, setShared] = useState(false);

  const handleShare = useCallback(() => {
    if (!onShare) return;
    hapticMedium();
    onShare();
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [onShare]);

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-5 pt-3">
        <Pressable onPress={onBrowse} hitSlop={12} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <ChevronLeft size={20} color="#F4F5F0" />
        </Pressable>
        <Pressable onPress={onBrowse} className="flex-1 items-center">
          <Text className="text-[16px] font-semibold text-[#F4F5F0]">
            {book.name} {chapter}
          </Text>
          <Text className="text-[10px] uppercase tracking-[1px] text-[#95A89C]">World English Bible</Text>
        </Pressable>
        <Pressable onPress={onClose} hitSlop={12} className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <X size={18} color="#F4F5F0" />
        </Pressable>
      </View>

      <View className="mt-3 flex-row items-center justify-between px-5">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => onFontSizeChange(Math.max(MIN_FONT_SIZE, fontSize - 2))}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
          >
            <Minus size={14} color="#F4F5F0" />
          </Pressable>
          <Text className="text-[11px] text-[#95A89C]">Aa</Text>
          <Pressable
            onPress={() => onFontSizeChange(Math.min(MAX_FONT_SIZE, fontSize + 2))}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center rounded-full bg-white/10"
          >
            <Plus size={14} color="#F4F5F0" />
          </Pressable>
        </View>

        {isHost && onShare ? (
          <Pressable
            onPress={handleShare}
            className="flex-row items-center rounded-full bg-[#D7FF00] px-4 py-2"
          >
            <Share2 size={14} color="#0B1F0E" />
            <Text className="ml-1.5 text-[12px] font-semibold text-[#0B1F0E]">
              {shared ? "Shared with everyone" : "Share with everyone"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <FlashList
        data={verses}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        renderItem={({ item, index }) => (
          <Text style={{ fontSize, lineHeight: fontSize * 1.55 }} className="mb-3 text-[#F4F5F0]">
            <Text className="text-[11px] font-bold text-[#D7FF00]">{index + 1} </Text>
            {item}
          </Text>
        )}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-[13px] text-[#95A89C]">
            This chapter could not be loaded.
          </Text>
        }
      />

      <View className="flex-row items-center justify-between border-t border-white/10 px-5 py-3">
        <Pressable
          onPress={onPrevChapter}
          disabled={!onPrevChapter}
          className="flex-row items-center rounded-full bg-white/10 px-4 py-2"
          style={{ opacity: onPrevChapter ? 1 : 0.35 }}
        >
          <ChevronLeft size={16} color="#F4F5F0" />
          <Text className="ml-1 text-[12px] text-[#F4F5F0]">Previous</Text>
        </Pressable>
        <Pressable
          onPress={onNextChapter}
          disabled={!onNextChapter}
          className="flex-row items-center rounded-full bg-white/10 px-4 py-2"
          style={{ opacity: onNextChapter ? 1 : 0.35 }}
        >
          <Text className="mr-1 text-[12px] text-[#F4F5F0]">Next</Text>
          <ChevronRight size={16} color="#F4F5F0" />
        </Pressable>
      </View>
    </View>
  );
};

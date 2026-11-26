import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Expand,
  ExternalLink,
  Images,
  Pause,
  Play,
  Search,
  X,
} from 'lucide-react'
import {
  archiveEras,
  archivePhotos,
  MAIN_PORTAL_URL,
  type ArchiveEraId,
  type ArchivePhoto,
} from './data/archiveData'

const INITIAL_PER_ERA = 12
const LOAD_MORE_STEP = 24

function normalizeVi(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
}

export function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeEraId, setActiveEraId] = useState<ArchiveEraId>('era-1977-1984')
  const [visibleLimits, setVisibleLimits] = useState<Record<ArchiveEraId, number>>({
    'era-1977-1984': INITIAL_PER_ERA,
    'era-1984-1988': INITIAL_PER_ERA,
    'era-1989-2005': INITIAL_PER_ERA,
    'era-2005-2017': INITIAL_PER_ERA,
    'era-2018-nay': INITIAL_PER_ERA,
  })
  const [lightboxList, setLightboxList] = useState<ArchivePhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [slideshowOn, setSlideshowOn] = useState(false)

  // Group filtered photos by chronological era
  const groupedEras = useMemo(() => {
    const q = normalizeVi(searchQuery.trim())
    return archiveEras.map((era) => {
      const photos = archivePhotos.filter((p) => {
        if (p.eraId !== era.id) return false
        if (!q) return true
        const hay = normalizeVi(`${p.caption} ${p.year} ${p.source} ${era.period} ${era.title}`)
        return hay.includes(q)
      })
      return { era, photos }
    })
  }, [searchQuery])

  const allFilteredPhotos = useMemo(
    () => groupedEras.flatMap((g) => g.photos),
    [groupedEras]
  )

  const activeEraIndex = Math.max(
    0,
    archiveEras.findIndex((e) => e.id === activeEraId)
  )
  const progressPercent = Math.round(((activeEraIndex + 1) / archiveEras.length) * 100)

  const activeLightboxPhoto: ArchivePhoto | null =
    lightboxIndex !== null && lightboxIndex >= 0 && lightboxIndex < lightboxList.length
      ? lightboxList[lightboxIndex]
      : null

  const activeLightboxEra = activeLightboxPhoto
    ? archiveEras.find((e) => e.id === activeLightboxPhoto.eraId) ?? null
    : null

  // Scroll-spy: highlight the era currently in view on the sticky right progress rail
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) {
          setActiveEraId(visible[0].target.id as ArchiveEraId)
        }
      },
      { rootMargin: '-18% 0px -55% 0px', threshold: [0.05, 0.2] }
    )

    archiveEras.forEach((era) => {
      const el = document.getElementById(era.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [searchQuery])

  const scrollToEra = (eraId: ArchiveEraId) => {
    setActiveEraId(eraId)
    const el = document.getElementById(eraId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const openPhotoLightbox = (photos: ArchivePhoto[], index: number, autoPlay = false) => {
    if (photos.length === 0) return
    setLightboxList(photos)
    setLightboxIndex(index)
    setSlideshowOn(autoPlay)
  }

  // Keyboard navigation in Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null)
        setSlideshowOn(false)
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % Math.max(1, lightboxList.length)
        )
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + lightboxList.length) % Math.max(1, lightboxList.length)
        )
      } else if (e.key === ' ') {
        e.preventDefault()
        setSlideshowOn((s) => !s)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, lightboxList.length])

  // Auto-advance slideshow timer (4 seconds)
  useEffect(() => {
    if (!slideshowOn || lightboxIndex === null || lightboxList.length <= 1) return
    const timer = window.setInterval(() => {
      setLightboxIndex((prev) =>
        prev === null ? null : (prev + 1) % lightboxList.length
      )
    }, 4000)
    return () => window.clearInterval(timer)
  }, [slideshowOn, lightboxIndex, lightboxList.length])

  return (
    <div id="top" className="min-h-screen bg-[#FAF6F0] text-[#1F1D1B]">
      {/* STICKY EDITORIAL NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#E6DFD3] bg-[#FAF6F0]/92 backdrop-blur-md shadow-[0_4px_20px_rgba(31,29,27,0.05)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3.5">
            <img
              src="./images/logo-cdhc2.png"
              alt="Biểu trưng Trường Cao đẳng Hậu cần 2"
              className="h-11 w-11 shrink-0 object-contain"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B1E1E]">
                Kho Tư liệu Ảnh Truyền thống
              </p>
              <h1 className="text-lg font-bold leading-snug text-[#1F1D1B] sm:text-xl">
                Trường Cao đẳng Hậu cần 2
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openPhotoLightbox(allFilteredPhotos, 0, true)}
              className="btn-heritage-outline hidden items-center gap-2 rounded-[4px] border border-[#C5A059] bg-white px-4 py-2 text-xs font-semibold text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-[#FAF6F0] sm:inline-flex"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Trình chiếu Slideshow
            </button>

            <a
              href={MAIN_PORTAL_URL}
              className="btn-heritage-primary inline-flex items-center gap-2 rounded-[4px] bg-[#8B1E1E] px-4 py-2 text-xs font-semibold text-[#FAF6F0] sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 text-[#E6CFA0]" />
              <span>Không gian Truyền thống số</span>
            </a>
          </div>
        </div>
      </header>

      {/* MOBILE STICKY HORIZONTAL TIMELINE BAR (< lg) */}
      <div className="sticky top-[73px] z-30 border-b border-[#E6DFD3] bg-white/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {groupedEras.map(({ era, photos }) => {
            const isActive = activeEraId === era.id
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => scrollToEra(era.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-[#8B1E1E] bg-[#8B1E1E] text-[#FAF6F0]'
                    : 'border-[#E6DFD3] bg-[#FAF6F0] text-[#4A4744]'
                }`}
              >
                <span>{era.period}</span>
                <span
                  className={`rounded-[3px] px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-[#76716A]'
                  }`}
                >
                  {photos.length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="relative border-b border-[#E6DFD3] bg-[#FAF6F0]">
        <div className="editorial-hairline h-[2px] w-full opacity-75" />
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold leading-tight text-[#1F1D1B] sm:text-4xl lg:text-[42px]">
                Kho Tư liệu Ảnh theo Dòng thời gian{' '}
                <span className="text-[#8B1E1E]">(1977 – Nay)</span>
              </h2>
              <p className="mt-3 text-base leading-[1.7] text-[#4A4744]">
                Lưu giữ trực quan hành trình gần nửa thế kỷ xây dựng và trưởng thành của Nhà trường —
                số hóa từ sách ảnh{' '}
                <strong className="font-semibold text-[#1F1D1B]">
                  “40 năm xây dựng và trưởng thành (1977–2017)”
                </strong>{' '}
                kết hợp tư liệu lịch sử và hình ảnh Trường Cao đẳng Hậu cần 2 giai đoạn 2018 đến nay.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:shrink-0">
              <div className="rounded-[6px] border border-[#E6DFD3] bg-white px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#8B1E1E]">{archivePhotos.length}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#76716A]">
                  Ảnh tư liệu
                </p>
              </div>
              <div className="rounded-[6px] border border-[#E6DFD3] bg-white px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#8B1E1E]">{archiveEras.length}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#76716A]">
                  Giai đoạn
                </p>
              </div>
              <div className="rounded-[6px] border border-[#E6DFD3] bg-white px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#8B1E1E]">148</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#76716A]">
                  Trang sách ảnh
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN 2-COLUMN LAYOUT: LEFT CONTINUOUS TIMELINE + RIGHT STICKY PROGRESS RAIL */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_272px]">
          {/* LEFT COLUMN: SEARCH + CONTINUOUS 5-ERA GALLERY */}
          <div className="min-w-0 space-y-12">
            {/* Clean Search Bar (NO category chips!) */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-[#E6DFD3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#C5A059]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo chú thích, tên lãnh đạo, sự kiện hoặc năm (VD: 1984, Hà Thanh, COVID, Lê Văn Việt)..."
                  className="w-full rounded-[4px] border border-[#E6DFD3] bg-[#FAF6F0]/60 py-2.5 pr-9 pl-10 text-sm text-[#1F1D1B] placeholder:text-[#76716A] focus:border-[#8B1E1E] focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-[#76716A] hover:bg-[#E6DFD3]/50 hover:text-[#1F1D1B]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="shrink-0 text-xs text-[#76716A]">
                Hiển thị <strong className="text-[#8B1E1E]">{allFilteredPhotos.length}</strong> / {archivePhotos.length} ảnh
              </div>
            </div>

            {/* Empty Search Result */}
            {allFilteredPhotos.length === 0 ? (
              <div className="rounded-[6px] border border-[#E6DFD3] bg-white p-12 text-center">
                <Images className="mx-auto h-10 w-10 text-[#C5A059]" />
                <p className="mt-3 text-base font-bold text-[#1F1D1B]">
                  Không tìm thấy ảnh tư liệu phù hợp với từ khóa “{searchQuery}”
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="btn-heritage-primary mt-5 rounded-[4px] bg-[#8B1E1E] px-5 py-2.5 text-sm font-semibold text-[#FAF6F0]"
                >
                  Xem lại toàn bộ ảnh
                </button>
              </div>
            ) : (
              groupedEras.map(({ era, photos }) => {
                if (photos.length === 0) return null
                const limit = searchQuery.trim() ? photos.length : visibleLimits[era.id]
                const shown = photos.slice(0, limit)
                const remaining = photos.length - shown.length

                return (
                  <section
                    key={era.id}
                    id={era.id}
                    className="scroll-mt-28 space-y-6"
                  >
                    {/* Era Section Header */}
                    <div className="rounded-[6px] border-l-4 border-[#8B1E1E] border-y border-r border-y-[#E6DFD3] border-r-[#E6DFD3] bg-white p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8B1E1E]">
                          <span>GIAI ĐOẠN {era.order}</span>
                          <span className="text-[#C5A059]">•</span>
                          <span>{era.period}</span>
                        </div>
                        <span className="rounded-[4px] border border-[#E6DFD3] bg-[#FAF6F0] px-2.5 py-0.5 text-xs font-semibold text-[#4A4744]">
                          {photos.length} ảnh tư liệu
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-[#1F1D1B] sm:text-2xl">
                        {era.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-[1.7] text-[#4A4744]">
                        {era.description}
                      </p>
                    </div>

                    {/* Clean 3-Column Photo Grid (NO category tags!) */}
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {shown.map((photo, idx) => (
                        <article
                          key={photo.id}
                          onClick={() => openPhotoLightbox(photos, idx, false)}
                          className="group card-heritage-hover flex cursor-pointer flex-col overflow-hidden rounded-[6px] border border-[#E6DFD3] bg-white"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFE8DC]">
                            <img
                              src={photo.imageUrl}
                              alt={photo.caption}
                              loading="lazy"
                              className={`img-heritage-zoom h-full w-full object-cover ${
                                photo.isPortrait ? 'object-[center_16%]' : 'object-center'
                              }`}
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1D1B]/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-[4px] bg-[#1F1D1B]/82 px-2 py-0.5 text-[11px] font-semibold text-[#E6CFA0] backdrop-blur-xs">
                              <Calendar className="h-3 w-3" />
                              {photo.year}
                            </span>
                            <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-[4px] border border-white/25 bg-[#1F1D1B]/80 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <Expand className="h-3 w-3" />
                              Phóng to
                            </span>
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-[#1F1D1B]">
                              {photo.caption}
                            </p>
                            <p className="mt-3 border-t border-[#E6DFD3]/70 pt-2.5 text-[11px] text-[#76716A]">
                              {photo.source}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>

                    {/* Expand / Collapse Controls for large eras */}
                    {!searchQuery.trim() && photos.length > INITIAL_PER_ERA && (
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                        {remaining > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setVisibleLimits((prev) => ({
                                  ...prev,
                                  [era.id]: prev[era.id] + LOAD_MORE_STEP,
                                }))
                              }
                              className="btn-heritage-primary inline-flex items-center gap-1.5 rounded-[4px] bg-[#8B1E1E] px-5 py-2.5 text-xs font-semibold text-[#FAF6F0]"
                            >
                              <ChevronDown className="h-4 w-4 text-[#E6CFA0]" />
                              Xem thêm {Math.min(LOAD_MORE_STEP, remaining)} ảnh (còn {remaining} ảnh)
                            </button>
                            {remaining > LOAD_MORE_STEP && (
                              <button
                                type="button"
                                onClick={() =>
                                  setVisibleLimits((prev) => ({
                                    ...prev,
                                    [era.id]: photos.length,
                                  }))
                                }
                                className="btn-heritage-outline inline-flex items-center gap-1.5 rounded-[4px] border border-[#E6DFD3] bg-white px-4 py-2.5 text-xs font-semibold text-[#4A4744] hover:border-[#C5A059] hover:text-[#8B1E1E]"
                              >
                                Mở tất cả ({photos.length} ảnh)
                              </button>
                            )}
                          </>
                        )}
                        {shown.length > INITIAL_PER_ERA && (
                          <button
                            type="button"
                            onClick={() => {
                              setVisibleLimits((prev) => ({
                                ...prev,
                                [era.id]: INITIAL_PER_ERA,
                              }))
                              scrollToEra(era.id)
                            }}
                            className="inline-flex items-center gap-1 rounded-[4px] border border-[#E6DFD3] bg-white px-4 py-2.5 text-xs font-semibold text-[#76716A] transition-colors hover:border-[#C5A059] hover:text-[#8B1E1E]"
                          >
                            <ChevronUp className="h-4 w-4" />
                            Thu gọn giai đoạn này
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                )
              })
            )}
          </div>

          {/* RIGHT COLUMN: STICKY ALWAYS-VISIBLE TIMELINE PROGRESS RAIL */}
          <aside
            aria-label="Tiến trình các giai đoạn lịch sử"
            className="hidden lg:sticky lg:top-24 lg:block"
          >
            <div className="rounded-[6px] border border-[#E6DFD3] bg-white p-5 shadow-[0_8px_28px_-14px_rgba(31,29,27,0.12)]">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B1E1E]">
                  <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                  Tiến trình Dòng thời gian
                </span>
                <span className="text-xs font-bold text-[#8B1E1E]">{progressPercent}%</span>
              </div>

              {/* Overall Progress Bar */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EFE8DC]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B1E1E] to-[#C5A059] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Vertical Timeline Steps */}
              <ol className="relative mt-5 space-y-2 border-l-2 border-[#E6DFD3] pl-4">
                {groupedEras.map(({ era, photos }, idx) => {
                  const isActive = activeEraId === era.id
                  const isPassed = idx < activeEraIndex
                  return (
                    <li key={era.id} className="relative">
                      <span
                        className={`absolute -left-[23px] top-3.5 flex h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? 'scale-125 border-[#8B1E1E] bg-[#8B1E1E] ring-4 ring-[#8B1E1E]/15'
                            : isPassed
                            ? 'border-[#C5A059] bg-[#C5A059]'
                            : 'border-[#C5A059]/70 bg-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => scrollToEra(era.id)}
                        className={`w-full rounded-[5px] border px-3 py-2.5 text-left transition-all duration-200 ${
                          isActive
                            ? 'border-[#C5A059] bg-[#FAF6F0] shadow-xs'
                            : 'border-transparent hover:border-[#E6DFD3] hover:bg-[#FAF6F0]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[11px] font-bold tracking-wide ${
                              isActive ? 'text-[#8B1E1E]' : 'text-[#76716A]'
                            }`}
                          >
                            {era.order} • {era.period}
                          </span>
                          <span
                            className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold ${
                              isActive
                                ? 'bg-[#8B1E1E] text-[#FAF6F0]'
                                : 'bg-[#FAF6F0] text-[#76716A]'
                            }`}
                          >
                            {photos.length}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-xs leading-snug ${
                            isActive ? 'font-bold text-[#1F1D1B]' : 'font-medium text-[#4A4744]'
                          }`}
                        >
                          {era.shortTitle}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ol>

              {/* Quick Actions */}
              <div className="mt-5 space-y-2 border-t border-[#E6DFD3] pt-4">
                <button
                  type="button"
                  onClick={() => openPhotoLightbox(allFilteredPhotos, 0, true)}
                  className="btn-heritage-outline flex w-full items-center justify-center gap-2 rounded-[4px] border border-[#C5A059] bg-[#FAF6F0] px-3 py-2 text-xs font-semibold text-[#8B1E1E] hover:bg-[#8B1E1E] hover:text-[#FAF6F0]"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Trình chiếu Slideshow
                </button>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-[#E6DFD3] bg-white px-3 py-2 text-xs font-medium text-[#4A4744] transition-colors hover:border-[#C5A059] hover:text-[#8B1E1E]"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  Lên đầu trang
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* LIGHTBOX + SLIDESHOW MODAL (NO category tags!) */}
      <AnimatePresence>
        {activeLightboxPhoto && lightboxIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setLightboxIndex(null)
              setSlideshowOn(false)
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141210]/94 p-4 backdrop-blur-sm sm:p-8"
          >
            {/* Top Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="mb-3 flex w-full max-w-5xl items-center justify-between gap-3 text-xs text-[#FAF6F0]"
            >
              <div className="flex items-center gap-2.5">
                <span className="rounded-[4px] bg-[#8B1E1E] px-2.5 py-1 font-bold">
                  {lightboxIndex + 1} / {lightboxList.length}
                </span>
                <span className="hidden text-[#E6CFA0] sm:inline">
                  {activeLightboxEra ? `Giai đoạn ${activeLightboxEra.period}` : ''} • {activeLightboxPhoto.year}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSlideshowOn((s) => !s)}
                  className={`inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 font-semibold transition-colors ${
                    slideshowOn
                      ? 'border-[#C5A059] bg-[#C5A059] text-[#1F1D1B]'
                      : 'border-white/25 bg-white/10 text-white hover:border-[#C5A059]'
                  }`}
                >
                  {slideshowOn ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      Dừng trình chiếu
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Trình chiếu tự động
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(null)
                    setSlideshowOn(false)
                  }}
                  aria-label="Đóng xem ảnh"
                  className="rounded-full border border-white/25 bg-white/10 p-2 text-white hover:bg-[#8B1E1E]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Image Stage */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-5xl flex-1 items-center justify-center overflow-hidden rounded-[6px] border border-[#C5A059]/40 bg-black/60"
            >
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + lightboxList.length) % lightboxList.length
                  )
                }
                aria-label="Ảnh trước"
                className="absolute left-3 z-10 rounded-full border border-white/25 bg-[#1F1D1B]/80 p-3 text-white transition-colors hover:border-[#C5A059] hover:bg-[#8B1E1E]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <img
                key={activeLightboxPhoto.id}
                src={activeLightboxPhoto.imageUrl}
                alt={activeLightboxPhoto.caption}
                className="max-h-[68vh] w-auto max-w-full object-contain p-2"
              />

              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % lightboxList.length)
                }
                aria-label="Ảnh tiếp theo"
                className="absolute right-3 z-10 rounded-full border border-white/25 bg-[#1F1D1B]/80 p-3 text-white transition-colors hover:border-[#C5A059] hover:bg-[#8B1E1E]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Caption Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3 w-full max-w-5xl rounded-[6px] border border-white/15 bg-[#1F1D1B]/95 px-5 py-4 text-[#FAF6F0]"
            >
              <p className="text-sm font-medium leading-relaxed sm:text-base">
                {activeLightboxPhoto.caption}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#E6CFA0]/85">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  {activeLightboxPhoto.source}
                </span>
                <span className="text-[#FAF6F0]/60">
                  Mẹo: dùng phím ← / → để chuyển ảnh • Space bật/tắt trình chiếu • Esc để đóng
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-[#E6DFD3] bg-[#1F1D1B] py-10 text-[#FAF6F0]/85">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 text-center sm:flex-row sm:px-8 sm:text-left lg:px-10">
          <div className="flex items-center gap-3.5">
            <img
              src="./images/logo-cdhc2.png"
              alt="Logo Trường Cao đẳng Hậu cần 2"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-base font-bold text-white">Trường Cao đẳng Hậu cần 2</p>
              <p className="text-xs text-[#C5A059]">
                Kho Tư liệu Ảnh Truyền thống (1977 – Nay)
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:items-end">
            <p className="text-xs italic text-[#FAF6F0]/75">
              “Đoàn kết, sáng tạo, dạy tốt, học tốt, kỷ luật nghiêm, phục vụ tốt”
            </p>
            <a
              href={MAIN_PORTAL_URL}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] transition-colors hover:text-white"
            >
              Quay về Không gian Truyền thống số &amp; Bảo tàng 3D
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

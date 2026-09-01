# UI Spec — "Hạnh Phúc Tới Nơi" Homepage (LOMAR)

## 1. Overview

The homepage is the landing page for the **Hạnh Phúc Tới Nơi** wedding &amp; lifestyle district located on **Hồ Văn Huê street**. The design uses a warm, romantic, illustrated "gift box" aesthetic to welcome couples and introduce the services available in the district.

## 2. Design Language

| Element | Specification |

|---|---|

| **Overall aesthetic** | Illustrated / watercolor, warm, gift-like, romantic |

| **Primary background** | Warm cream / beige |

| **Primary accent color** | Dark green |

| **Secondary accent color** | Soft pink |

| **Texture/style** | Hand-drawn illustration, soft rounded shapes, decorative floral/botanical touches |

| **Primary language** | Vietnamese |

## 3. Layout &amp; Sections

### 3.1 Navigation Bar

- Display the **"Hạnh Phúc Tới Nơi"** logo/wordmark.

- Navigation links (in order):

  1. **TRANG CHỦ** (Home)

  2. **DỊCH VỤ** (Services)

  3. **BẢN ĐỒ HẠNH PHÚC** (Happiness Map)

  4. **BLOG**

  5. **WEDDING GUIDE**

- Navigation style should feel soft/elegant, matching the overall palette.

### 3.2 Hero Section

- Large welcoming headline for couples visiting the district.

- Warm cream background with a strong, welcoming Vietnamese message introducing the wedding destination.

- Decorative illustrated elements (floral/cosmetic/sparkle accents) around or behind the headline.

- Should immediately communicate: *this is a destination for wedding preparation and lifestyle services.*

### 3.3 Service Categories (Icon Tiles)

A set of illustrated icon/illustration tiles introducing the main service areas. Recommended layout: a responsive grid (2 columns on mobile, 3 columns on desktop).

Services to feature (with icons/illustrations):

1. **Fashion** — wedding fashion / bridal &amp; groom attire

2. **Makeup** — makeup &amp; beauty services

3. **Studio Photography** — photography studios

4. **Jewelry** — wedding rings &amp; accessories

5. **Gifts &amp; Accessories** — gifts, souvenirs, lifestyle accessories

6. **Health &amp; Wellness** — wellness services related to wedding prep / beauty care

Each tile should:

- Have a unique, soft, pastel/watercolor illustration or icon

- Display the service name in Vietnamese

- Be clickable, linking to the corresponding services page/detail

### 3.4 Illustrated District / Street Scene

- A hand-drawn illustrated street scene representing the **Hồ Văn Huê** wedding district.

- Should convey a strollable shopping street with multiple storefronts/services.

- Use the flat/watercolor illustration style consistent with the rest of the page.

- Optionally include a call-to-action encouraging users to explore the "Bản Đồ Hạnh Phúc" (Happiness Map) or visit the district.

### 3.5 Supporting Sections (Suggested)

These are common supporting blocks to complete the page:

- **Introduction/About the district** — short copy about Hồ Văn Huê as a wedding/lifestyle destination.

- **Prominent CTA** — a button such as *"Khám phá ngay"* (Explore now) or *"Xem bản đồ hạnh phúc"*.

- **Footer** — standard site footer with contact/link info.

## 4. Responsive Behavior

- Mobile: single-column layout, hamburger-style mobile nav (or condensed navigation), stacked service tiles.

- Tablet: 2-column service grid; hero text scales down gracefully.

- Desktop: full-width hero, 3-column service grid, illustrated district scene displayed prominently.

## 5. Copy Direction (Vietnamese)

- Hero headline should feel warm and welcoming, e.g. something like *"Chào mừng đến với Hạnh Phúc Tới Nơi"*.

- Service section heading should be neutral but inviting, e.g. *"Dịch vụ trong khu phố"* / *"Khu phố hạnh phúc"*.

- Use respectful, festive, and romantic tones throughout.

## 6. Suggested Implementation Mapping (LOMAR)

| Design block | Existing file(s) |

|---|---|

| Navbar | `Navbar.tsx`](LOMAR/src/shared/layout/Navbar.tsx) |

| Home layout | `HomePage.tsx`](LOMAR/src/features/home/HomePage.tsx) |

| Hero section | `HeroSection.tsx`](LOMAR/src/features/home/components/HeroSection.tsx) |

| Service icon tiles | `HomeIcons.tsx`](LOMAR/src/features/home/components/HomeIcons.tsx) |

| Story/about section | `StorySection.tsx`](LOMAR/src/features/home/components/StorySection.tsx) |

| CTA section | `JourneyCTA.tsx`](LOMAR/src/features/home/components/JourneyCTA.tsx) |

| Development/progress | `DevelopmentSection.tsx`](LOMAR/src/features/home/components/DevelopmentSection.tsx) |

| Homepage content/copy | `content.ts`](LOMAR/src/features/home/content.ts) |

| Homepage types | `types.ts`](LOMAR/src/features/home/types.ts) |

## 7. Acceptance Criteria

1. Homepage visually matches the "Hạnh Phúc Tới Nơi" design mockup: cream background, dark green + pink accents, illustrated style.

2. Navigation matches the 5-link structure shown in the mockup.

3. Six service categories are rendered as clickable illustrated tiles with proper Vietnamese labels.

4. The illustrated district street scene is included as a distinct section.

5. Layout is responsive (mobile / tablet / desktop).

6. All Vietnamese copy/spelling matches the mockup tones and phrasing.
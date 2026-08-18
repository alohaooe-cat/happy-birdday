# Brief: visual audit and design pass — HAPPY BIRDDAY

## What this project is

A single-page birthday invitation. The guest takes a "what bird are you"
quiz, gets one of three results (Жаворонок / Голубь / Сова — lark, pigeon,
owl), reads the plan for the day, and checks in via the "Перекличка"
(roll call) section. The site is already published. It will not be sent to
guests until your changes land, but do not break it.

- Folder: `/Users/tatianavlasova/Life-lab/happy-birdday`
- Live site: https://alohaooe-cat.github.io/happy-birdday/
- Repository: https://github.com/alohaooe-cat/happy-birdday
- Stack: Vite + React + TypeScript, plain CSS, no framework

**All site content is in Russian and must stay Russian.** Talk to the owner
in Russian too — read `/Users/tatianavlasova/Life-lab/wiki/communication.md`
first. Short version: no filler, no "great question", never describe a plan
instead of doing the work.

## Running and checking

```bash
cd /Users/tatianavlasova/Life-lab/happy-birdday
npm run dev          # dev server on :5173
npx tsc -b --noEmit  # types
npx oxlint src       # lint
npm run build        # production build
```

All three checks must pass before any commit.

Deployment: pushing to `main` triggers a GitHub Actions workflow that builds
and publishes the site. The secrets `VITE_GOOGLE_APPS_SCRIPT_URL` and
`VITE_FORM_TOKEN` are already configured in the repository — do not touch
them and never print them to logs.

**Do not break response submission.** `src/lib/storage.ts`,
`google-apps-script/Code.gs` and the fields in `src/types.ts` are wired to a
Google Sheet that collects guest responses. If you touch anything nearby,
verify `sendResponse` still sends the same payload shape.

## Design intent

A loud editorial poster: a bit of punk, a bit of magazine layout, saturated
blue / coral / lime, paper texture, expressive Cyrillic typography, bird
humour. The site must **not** look like a corporate landing page, an online
shop, or a website-builder template.

Palette and fonts live in `:root` at the top of `src/App.css`. Headings use
Prata (serif), UI uses Unbounded, body text uses Manrope, and the
ornithologist's name (Ричард) uses Great Vibes (copperplate script).

## Where the copy lives

All content and UI strings are in `src/data/content.ts`, including a `ui`
block with button labels, section headings and status messages. No literal
copy in components — if you add a new string, add a key to `content.ts`.

Text supports lightweight inline markup, handled by the `RichText` component
in `src/App.tsx`:

- `*Ричард*` — script font
- `~Таня~` — accent colour
- `**29 августа**` — lime marker
- `__26 августа__` — coral marker

---

# Tasks

## 1. Alignment audit — the main one

Walk the entire site and check text alignment in every block. This is the
owner's main complaint: columns, eyebrows, headings and paragraphs drift
relative to each other in several places.

Check at widths **390, 768, 1280, 1440, 1920 and 2560 px**, and also on a
short window (e.g. 1440×800) — some problems only appear there. Check all
three quiz results, both states of the roll call (before and after saving),
and the "В этот раз прилететь не смогу" (can't come) path.

Do not trust your eye: measure `getBoundingClientRect()` on neighbouring
elements and compare coordinates. The owner has repeatedly spotted
misalignments that are almost invisible in a screenshot.

## 2. Section headings at the top, not vertically centred

In several sections the heading and its eyebrow sit vertically centred in
their column while the adjacent text starts at the top. Headings should be
top-aligned — the owner finds that tidier.

`src/App.css` has more than a dozen `align-items: center` rules. Go through
them: keep the ones that align content within a row (buttons, chips, an icon
next to text), switch the section-level grids to `start`.

## 3. Rework the "Оперение" (dress code) section

The owner finds it ugly. It is currently a four-column `.dress-copy` grid:
feather icon, eyebrow, an oversized "Оперение" heading, and a paragraph. The
proportions fall apart, and the heading had to be pinned with
`white-space: nowrap` to stop it breaking mid-word.

Rebuild the composition in the spirit of the rest of the site. Two
constraints: the section is dark, and the accessory gallery follows it.

## 4. Remove all numbering

The `01 02 03` numerals appear in four places:

- `src/App.tsx:707` — plan of the day, `.timeline-index`
- `src/App.tsx:806` — gift steps, `.gift-steps`
- `src/App.tsx:529` — route highlights, `.route-list`
- `src/App.css:1693` — weather scenarios, the `weather-step` counter

Replace them with minimal marks: dots, ticks, or a feather outline (a
feather fits the bird theme well). One mark across the whole site or
different marks per section is your call, but the system must read as
deliberate.

Note: in the plan of the day the numeral is also a coral tile with a hard
shadow that anchors the left column. Don't leave a hole where it was.

## 5. Remove the struck-through "th" in the wordmark

`<span className="correction-th">th</span>` at `src/App.tsx:380` (cover) and
`src/App.tsx:836` (footer); styles at `.correction-th` in `src/App.css:299`.
Remove both the markup and the styles, including the media-query rule around
line 2569. The wordmark should read as `HAPPY BIRDDAY` with no proofreader's
correction mark.

## 6. Lay the accessory gallery out in a heart shape

The fifteen cards in `.product-grid` currently sit in a scattered
rectangular grid. Arrange them into a heart.

Requirements: the heart must not fall apart on narrow screens — provide a
fallback layout. Cards stay clickable links and labels stay readable. Images
are in `public/products/`, the list is the `products` array in `content.ts`.

## 7. Pin the cover postcard with a push-pin

The `.bird-scene` image on the first screen is styled as a paper postcard
with a white mat. Add a stationery push-pin in one corner, as if the
postcard were pinned to a wall. Draw the pin in CSS or SVG, not as an image
file.

## 8. The "Бланк наблюдателя" panel in the roll call

Section "Перекличка" (`.confirmation`, `.choice-panel` in `src/App.css`).
Two complaints:

**Colours.** The owner dislikes the combination. Right now a white panel
with a black border and hard shadow sits on the section's pale-blue
background, with a coral "бланк наблюдателя" tab, a lime selected option
carrying a coral shadow, and a pale-pink dress-code checkbox block. The pink
error block and the coral tab next to the lime selection make a muddy mix.
Rebuild the panel's palette: bright and legible, inside the site's system,
but calmer than it is now.

**The panel does not fit on screen.** At typical laptop heights only part of
the form is visible and the tab at the top is clipped, so a guest may not
realise there is a submit button below. Find a more compact layout — for
example, putting the party-size stepper and the dress-code checkbox on one
row, or grouping the fields more tightly. Verify at 1440×800 and 1280×720.

## 9. Dress-code checkbox when the guest declines

The roll call offers three options. The third is "В этот раз прилететь не
смогу" (I can't come this time). The "Поддержу пернатый дресс-код" checkbox
is currently mandatory for every option: without it the submit button
refuses and shows "Ну пожааааааалуйста Т_Т".

For a guest who declines this is nonsense — they aren't coming, there is
nothing to dress up for, and yet they cannot check in at all. Make the
checkbox block deactivate when the third option is selected: visually dimmed
and no longer required.

The logic is in `src/App.tsx`: the `attendance` state
(`'walk' | 'later' | 'no'`), `dressPledge`, the guard inside `confirmRoute`,
and the `.dress-pledge` markup. Note that `dressPledge` is written to the
spreadsheet as its own column — on a decline it must still send `false`
rather than break the payload shape.

## 10. The quiz card runs past the bottom of the screen

The question screens and the name screen share one card, `.quiz-shell`
(`src/App.css`). It has `min-height: 580px`, the name form inside adds
`min-height: 470px`, and `.quiz-section` adds up to 90px of vertical
padding. On a short window the total does not fit: the bottom of the card,
along with its lime shadow, runs off the screen.

It is most obvious on the name screen, where there is a lot of slack between
the "Как тебя зовут?" heading and the buttons that can be reduced with no
loss.

Make the card fit at typical heights. Verify at 1440×800, 1280×720 and
1440×900, across all seven questions and the name screen — the tallest
question is the fourth one, about 03:40.

## 11. A long guest name must fit in the footer

The footer ends with "Буду ждать тебя, {name}!" (`.final-invitation` in
`src/App.css`, rendered in `src/App.tsx`). The name comes from guest input,
and the field allows up to 80 characters. With a long name the huge serif
line runs straight off the right edge of the screen.

The whole name must be visible. Wrapping onto several lines is fine and
expected. Make sure the type still scales sensibly, the lime-on-blue text
shadow does not smear, and nothing overflows horizontally at 390 px.

Test with a deliberately long name — for example a 40-character string of
Cyrillic letters — and also with a single unbroken word, which is the harder
case.

## 12. Slow the marquee down

`.flight-marquee-track` in `src/App.css:481` is currently `14s`. Too fast.
Pick something calmer, but keep the ribbon seamless: the words repeat three
times in each half of the track, and no empty gap may appear on the right on
wide screens.

---

# Reporting

- Do not say "done" until you have checked it in a browser at several widths.
- Do not invent results. If you did not verify something, say so.
- At the end, list what you changed, and separately what you found but chose
  not to touch without approval.
- The owner edits copy in `content.ts` in parallel with you. Check
  `git status` and `git diff` before committing — do not revert her edits.

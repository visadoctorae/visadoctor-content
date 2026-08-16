# Visa Doctor — Content Engine

Brand-consistent Instagram carousels, rendered programmatically. No AI imagery, no design tool, no monthly cost.

**GitHub account:** `visadoctorae`

---

## Setup (once, ~10 minutes)

1. Create a repo named **`visadoctor-content`** at github.com/new (public = free unlimited Actions minutes; private = 2,000 min/month, still plenty)
2. Upload everything in this folder — you can drag the whole thing into GitHub's web uploader
3. Go to **Settings → Actions → General → Workflow permissions** → select **"Read and write permissions"** → Save
4. Go to the **Actions** tab → **Render carousels** → **Run workflow**

Rendered PNGs land in `out/<deck-name>/`. They render automatically whenever you push a deck, and every Monday at 08:00 Dubai time.

---

## Making a carousel

Add a JSON file to `decks/`. That's the whole authoring interface.

```json
{
  "caption": "Keyword-led first line under 125 characters...",
  "alt": "Alt text with your keyword — this is a real ranking factor",
  "slides": [
    { "type": "cover", "tone": "dark", "tag": "STRAIGHT TALK",
      "headline": "YOUR HEADLINE", "sub": "Italic serif subhead", "note": "Optional bottom note" }
  ]
}
```

### Layout types

| Type | Use for | Key fields |
|---|---|---|
| `cover` | Opening slide | `tag` `headline` `sub` `note` |
| `numbered` | 3–5 step lists | `kicker` `headline` `items[]` |
| `statement` | One big idea | `headline` `sub` `body` |
| `bignumber` | A single figure, huge | `number` `label` `body` `tag` |
| `quote` | Client testimonial | `quote` `attribution` `detail` |
| `split` | Comparison | `headline` `left{title,items[]}` `right{...}` |
| `index` | Data table — the Appointment Index | `headline` `sub` `rows[{name,value}]` `note` |
| `photo` | Full-bleed image | `image` (path) `tag` `headline` `sub` |
| `cta` | Closing slide | `tag` `headline` `sub` `checks[]` |

### Tones

`dark` (navy) · `light` (cream) · `alert` (terracotta — news, urgency, scam warnings)

**Alternate them.** The renderer prints a rhythm check after every build and warns when consecutive slides share a layout or the whole deck uses one tone. That warning is the thing that made the old feed look repetitive — don't ignore it.

---

## Photos

`photo` slides need a real image. Use **free commercial-licence stock**:

- [Pexels](https://pexels.com) — 180k+ videos, millions of photos
- [Pixabay](https://pixabay.com)

Drop files in `assets/` and reference them: `"image": "assets/dubai-skyline.jpg"`

**Never** use AI-generated documents, passports, seals or embassy signage. Forgery-adjacent imagery is a legal and platform-policy problem.

---

## Publishing

Rendered slides are reachable at:

```
https://raw.githubusercontent.com/visadoctorae/visadoctor-content/main/out/<deck>/slide_01.png
```

Point your existing Make.com scenario at these URLs. Instagram's API needs a public image URL — this satisfies it, free.

---

## The rules that matter more than the design

1. **Every caption's first line carries the keyword.** Under 125 characters. Instagram indexes it and it surfaces in Google.
2. **Every post gets alt text.** Direct ranking factor. Currently your biggest unclaimed free reach.
3. **3–10 hashtags, in the caption.** Not 30, not in the first comment.
4. **Every post drives to the WhatsApp deep link.** A phone number in the footer is not a call-to-action.
5. **Never two consecutive posts with the same layout.** This is what your feed got wrong.
6. **Copy carries the proprietary angle** — your appointment data, your cases, your UAE-resident expertise. The engine renders weak copy just as beautifully as strong copy. It is a design system, not a judgement system.

---

## Cost

| | |
|---|---|
| Engine, fonts, rendering | $0 |
| GitHub Actions | $0 |
| Image hosting | $0 |
| **Total** | **$0/month** |

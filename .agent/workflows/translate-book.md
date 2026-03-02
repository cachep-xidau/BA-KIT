---
description: Translate PDF books into target language with structured output. Full pipeline from extraction to PDF export.
---

# /translate-book — PDF Book Translation Pipeline

$ARGUMENTS

---

## Usage

```bash
/translate-book '<source_pdf_or_dir>' <lang_code> '<output_dir>'

# Examples:
/translate-book 'book.pdf' vi './output'          # Single PDF → Vietnamese
/translate-book './pdfs/' zh './chinese_output'    # Batch (all PDFs in dir)
/translate-book 'medical.pdf' en './english'       # Single → English
```

**Supported languages:** `vi` (Vietnamese), `zh` (Chinese), `en` (English), `ja` (Japanese)

---

## Prerequisites

```bash
pip install paddlepaddle paddleocr[doc-parser]   # Phase 1: OCR extraction
pip install markdown anthropic                    # Phase 5: Translation
npm install -g md-to-pdf                          # Phase 7: PDF export
```

---

## Pipeline — 7 Phases

### Phase 1: Extract (PaddleOCR)

**Goal:** PDF → structured `.md` using PaddleOCR PP-StructureV3.

```bash
paddleocr pp_structurev3 -i ./book.pdf --save_path ./extracted/
```

Or Python: see `extract.py` in project pipeline. Handles scanned PDFs, tables, formulas, multi-column layouts.

**Validation:** Check extracted `.md` — should contain headings, paragraphs, tables.

---

### Phase 2: Setup API Key & Model

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# claude-sonnet-4-20250514 (fast) or claude-opus-4-20250514 (quality)
```

**Config** (`config.json`):
```json
{"api":"anthropic","model":"claude-sonnet-4-20250514","source_lang":"zh","target_lang":"vi","chunk_size":8000,"delay_between_calls":0,"stream":true}
```

---

### Phase 3: Chunk

**Goal:** Split markdown into ~8000 char chunks at paragraph boundaries.

Handled automatically by `translate.py` and `batch_translate.py`. See `translate_config.split_into_chunks()`.

---

### Phase 4: Monitor

```bash
python3 monitor.py    # Real-time progress dashboard
```

---

### Phase 5: Translate

**PERFORMANCE:** Always use scripts. NEVER translate manually inside Claude Code session — context bloat makes it 10x slower.

**Option 1 — Batch API (RECOMMENDED, 50% cost):**
```bash
python3 batch_translate.py submit              # Submit all chunks async
python3 batch_translate.py poll <batch_id>     # Poll until done
python3 batch_translate.py assemble            # Assemble final .md
```

**Option 2 — Streaming API (real-time):**
```bash
python3 translate.py --files "book_stem"       # Single file (streaming default)
python3 parallel_translate.py -n 4             # Multiple files parallel
```

**Option 3 — Manual (no API):** Agent translates in context, 10-20 chunks per write.

---

### Phase 6: Assemble

Combine translated chunks → final `.md`. Handled by `batch_translate.py assemble` or inline in `translate.py`.

---

### Phase 7: Export PDF

```bash
md-to-pdf translated/book.md                         # Method A (recommended)
pandoc book.md -o book.pdf --pdf-engine=xelatex       # Method B
python3 export_pdf_v2.py                              # Method C (Unicode safe)
```

---

## Project Structure

```
project/
├── translate_config.py    # Shared config, prompt, utilities
├── translate.py           # Streaming API translation
├── batch_translate.py     # Batch API (50% cost, async)
├── parallel_translate.py  # Parallel streaming workers
├── monitor.py             # Progress dashboard
├── export_pdf_v2.py       # PDF export
├── config.json            # API key, model, languages
├── name_mapping.json      # source_name → translated_name
├── extracted/             # .md files from PaddleOCR
├── chunks/                # Per-book chunk dirs
├── batches/               # Batch API metadata
├── translated/            # Final .md files
└── pdf_output/            # Final .pdf files
```

---

## Error Handling

| Error | Solution |
|-------|----------|
| `paddleocr` not found | `pip install paddlepaddle paddleocr[doc-parser]` |
| PaddleOCR GPU error | `pip install paddlepaddle-gpu` or `--device cpu` |
| PaddleOCR model download fails | `export PADDLE_PDX_MODEL_SOURCE=BOS` |
| `md-to-pdf` not found | `npm install -g md-to-pdf` |
| API 401/400 | Rotate key or switch to Gemini/manual |
| Unicode filename error | Use `export_pdf_v2.py` |
| Chunk too large | Reduce chunk_size to 5000 |
| Too slow | `batch_translate.py` or `parallel_translate.py -n 6` |
| Batch timeout | Re-poll: `python3 batch_translate.py poll <id>` |

---

## Skill Reference

**Load `@[.agent/skills/book-translation/SKILL.md]`** for:
- PaddleOCR configuration (PPStructureV3 options, lang codes)
- Language configs, translation quality standards
- Medical/TCM terminology handling
- PDF generation CSS templates

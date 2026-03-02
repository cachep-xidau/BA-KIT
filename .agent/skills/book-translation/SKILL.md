---
name: book-translation
description: Translate PDF books to target language with structured markdown output. Extraction methods, translation quality standards, and PDF generation references.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Book Translation Skill

Reference material for `/translate-book` workflow. Load sections as needed.

## Content Map

| Section | When to Load |
|---------|-------------|
| [§1 Extraction](#1-extraction) | PaddleOCR config → see `references/paddleocr-extraction.md` |
| [§2 Language Config](#2-language-configs) | Setting up translation |
| [§3 Translation Quality](#3-translation-quality) | During translation |
| [§4 Medical/TCM Terms](#4-medical-terminology) | Medical book translation |
| [§5 PDF Generation](#5-pdf-generation) | See `references/pdf-generation.md` |
| [§6 Troubleshooting](#6-troubleshooting) | When things break |

---

## 1. Extraction

See **`references/paddleocr-extraction.md`** for full PaddleOCR PP-StructureV3 config, options, and lang codes.

Quick start:
```bash
pip install paddlepaddle paddleocr[doc-parser]
paddleocr pp_structurev3 -i ./book.pdf --save_path ./extracted/
```

---

## 2. Language Configs

```python
LANGUAGES = {
    'vi': {'name': 'Tiếng Việt', 'paddle_lang': 'vietnam', 'font': 'Noto Serif'},
    'zh': {'name': '中文',       'paddle_lang': None,      'font': 'Noto Serif SC'},
    'ja': {'name': '日本語',     'paddle_lang': 'japan',   'font': 'Noto Serif JP'},
    'en': {'name': 'English',    'paddle_lang': 'en',      'font': 'Noto Serif'},
    'ko': {'name': '한국어',     'paddle_lang': 'korean',  'font': 'Noto Serif KR'},
}

PRESERVE_TERMS = ['API', 'SDK', 'HTTP', 'JSON', 'PDF', 'URL', 'HTML']
```

### Chapter Detection Patterns

`^(Chapter|CHAPTER)\s+\d+` | `^第.*[章节]` | `^Chương\s+\d+` | `^\d+\.\s+[A-Z]`

---

## 3. Translation Quality

| Rule | Detail |
|------|--------|
| **Preserve** | Proper nouns, author names, place names |
| **Translate** | Descriptions, instructions, commentary |
| **Romanize** | Technical terms where appropriate |
| **Consistent** | Same term = same translation throughout |
| **Natural** | Prioritize natural flow over literal accuracy |

### Formatting

- `##` chapters, `###` sections, `---` between major sections
- Preserve lists, tables, code blocks
- `**bold**` terms, `*italic*` emphasis
- Keep original measurements/dosages exact

### Chunking & Performance

```
Target: ~8000 chars/chunk (3x fewer API calls than old 3000)
Split on: paragraph boundaries (\n\n)
Never split: mid-sentence, mid-table, mid-list
```

- **Batch API** (`batch_translate.py`): 50% cost, async — best for large projects
- **Streaming** (`translate.py --stream`): real-time, enabled by default
- **No delay**: delay=0 default (set >0 only if rate-limited)
- **NEVER translate manually** in Claude Code session — 10x slower
- **Parallel** (`parallel_translate.py -n 4`): multiple files simultaneously

---

## 4. Medical Terminology

### Chinese → Vietnamese (Hán-Việt)

| Pattern | Example |
|---------|---------|
| Acupoints | 合谷 → Hợp Cốc (合谷) |
| Herbs | 当归 → Đương Quy (当归) |
| Formulas | 四君子汤 → Tứ Quân Tử Thang |
| Organs | 肝 → Can (Gan), 脾 → Tỳ (Lá lách) |
| Channels | 足太阳膀胱经 → Kinh Bàng Quang Thái Dương |

- First mention: Vietnamese + Chinese in parentheses
- Subsequent: Vietnamese only
- Dosages: Keep exact numbers, translate units

---

## 5. PDF Generation

See **`references/pdf-generation.md`** for CSS template, export methods, and font notes.

Quick: `md-to-pdf translated/book.md` or `python3 export_pdf_v2.py`

---

## 6. Troubleshooting

| Problem | Solution |
|---------|----------|
| PaddleOCR model slow | `export PADDLE_PDX_MODEL_SOURCE=BOS` |
| GPU OOM | `--device cpu` or `use_hpip=True` |
| Missing tables | Ensure `use_table_recognition=True` |
| Warped text | `use_doc_unwarping=True` |
| Rotated page | `use_doc_orientation_classify=True` |
| WeasyPrint error | Use `md-to-pdf` or `export_pdf_v2.py` |
| Unicode filename | Use `export_pdf_v2.py` |
| API key invalid | Rotate key or switch to manual |
| Font not rendering | Check font family (see references) |
| Chunk too large | Reduce to 5000 |
| Too slow | `batch_translate.py` or increase `chunk_size` |
| Batch not returning | Re-poll: `python3 batch_translate.py poll <id>` |
| Inconsistent terms | Build glossary in `name_mapping.json` |

---

## Success Cases

### Dieu Nga TCM Project (2026-02)
- **Input:** 43 Chinese medical PDFs (~2,800 pages)
- **Output:** 43 Markdown + 43 PDF files (125 MB total)
- **Pipeline:** PaddleOCR → chunk → Claude API → assemble → Puppeteer PDF
- **Scripts:** `translate_config.py`, `translate.py`, `batch_translate.py`, `parallel_translate.py`, `monitor.py`, `export_pdf_v2.py`

# PDF Generation & Export Reference

## CSS Template (Vietnamese)

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Noto+Sans:wght@400;700');

body {
    font-family: 'Noto Serif', serif;
    font-size: 11pt; line-height: 1.7; color: #1a1a1a;
    max-width: 700px; margin: 0 auto; padding: 40px;
}
h1 { font-family: 'Noto Sans', sans-serif; font-size: 22pt;
     color: #2c3e50; border-bottom: 3px solid #c0392b; }
h2 { font-family: 'Noto Sans', sans-serif; font-size: 16pt;
     color: #c0392b; border-bottom: 1px solid #ddd; }
h3 { font-family: 'Noto Sans', sans-serif; font-size: 13pt; color: #34495e; }
table { width: 100%; border-collapse: collapse; font-size: 10pt; }
th, td { border: 1px solid #bdc3c7; padding: 6px 10px; }
th { background: #ecf0f1; font-weight: bold; }
blockquote { border-left: 4px solid #c0392b; padding: 8px 16px;
             background: #fdf2f2; font-style: italic; }
```

## export_pdf_v2.py Pattern

```python
"""Batch Markdown → PDF using Puppeteer (handles Unicode filenames)."""
# 1. Convert .md → HTML via Python `markdown` library
# 2. Write HTML to temp file with ASCII filename
# 3. Launch Puppeteer via Node.js to render PDF
# 4. Move PDF to output directory
#
# Dependencies: markdown (pip), puppeteer (via md-to-pdf's node_modules)
# See: projects/Dieu Nga/pipeline/export_pdf_v2.py for full code
```

## Methods

```bash
md-to-pdf translated/book.md                         # Method A (recommended)
pandoc book.md -o book.pdf --pdf-engine=xelatex       # Method B
python3 export_pdf_v2.py                              # Method C (Unicode safe)
```

## Font Notes

| Language | Font Family |
|----------|------------|
| Vietnamese | `Noto Serif` |
| Chinese | `Noto Serif SC` / `Noto Sans SC` |
| Japanese | `Noto Serif JP` |
| Korean | `Noto Serif KR` |
| English | `Noto Serif` |

# PaddleOCR Extraction Reference

## Install

```bash
pip install paddlepaddle paddleocr[doc-parser]
# GPU: pip install paddlepaddle-gpu paddleocr[doc-parser]
```

## PPStructureV3 Options

```python
from paddleocr import PPStructureV3

# Default (Chinese + English)
pipeline = PPStructureV3()

# Language-specific
pipeline = PPStructureV3(lang="en")         # English
pipeline = PPStructureV3(lang="japan")       # Japanese
pipeline = PPStructureV3(lang="korean")      # Korean

# Document preprocessing (scanned/warped books)
pipeline = PPStructureV3(
    use_doc_orientation_classify=True,  # Auto-rotate
    use_doc_unwarping=True,             # Fix curved pages
    use_textline_orientation=True,      # Vertical text
)

# Feature toggles
pipeline = PPStructureV3(
    use_table_recognition=True,         # Tables → markdown
    use_formula_recognition=True,       # LaTeX formulas
    use_seal_recognition=False,         # Seal text (usually off)
)
```

## Extract PDF → Markdown

```python
from pathlib import Path
from paddleocr import PPStructureV3

def extract_pdf(pdf_path, output_dir, lang=None):
    opts = {"use_doc_orientation_classify": True}
    if lang:
        opts["lang"] = lang
    pipeline = PPStructureV3(**opts)
    output = pipeline.predict(input=str(pdf_path))
    md_parts = [res.markdown for res in output]
    md_text = pipeline.concatenate_markdown_pages(md_parts)
    out = Path(output_dir) / f"{Path(pdf_path).stem}.md"
    out.write_text(md_text)
    return out
```

## Lang Codes

| Language | `lang` value |
|----------|-------------|
| Chinese + English (default) | `None` |
| English | `"en"` |
| Japanese | `"japan"` |
| Korean | `"korean"` |
| Vietnamese | `"vietnam"` |
| 109 languages | See [PP-OCRv5 docs](https://paddlepaddle.github.io/PaddleOCR/latest/en/version3.x/algorithm/PP-OCRv5/PP-OCRv5_multi_languages.html) |

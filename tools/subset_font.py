# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools>=4.47", "brotli>=1.1"]
# ///
"""본문 글꼴(Pretendard Variable) 서브셋 생성.

사용법: node tools/build.mjs && uv run tools/subset_font.py
        (문구를 바꾼 뒤에는 서브셋을 다시 만들고, build를 한 번 더 실행해 캐시 버전을 갱신합니다)

- index.html과 js/v7.js에 쓰인 글자 + 기본 문장부호만 남깁니다.
- 원본 글꼴: tools/fonts-src/PretendardVariable.woff2 (없으면 jsDelivr의 pretendard 1.3.9에서 받습니다. git에는 올리지 않습니다)
- 결과: assets/fonts/pretendard-wt.woff2  (SIL OFL 1.1, assets/fonts/OFL-Pretendard.txt)
"""
from pathlib import Path
import urllib.request

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "fonts-src" / "PretendardVariable.woff2"
SRC_URL = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"
OUT = ROOT / "assets" / "fonts" / "pretendard-wt.woff2"

if not SRC.exists():
    SRC.parent.mkdir(parents=True, exist_ok=True)
    print("downloading", SRC_URL)
    urllib.request.urlretrieve(SRC_URL, SRC)

text = (ROOT / "index.html").read_text(encoding="utf-8") + (ROOT / "js" / "v7.js").read_text(encoding="utf-8")
chars = set(text)
chars |= {chr(c) for c in range(0x20, 0x7F)}          # ASCII
chars |= set("‘’“”·…–—→↗←↑↓×₩%·「」『』《》〈〉①②③④⑤")
chars = {c for c in chars if c.isprintable() or c == " "}

opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["*"]
opts.name_IDs = ["*"]
opts.name_legacy = True
opts.notdef_outline = True
opts.hinting = False

font = subset.load_font(str(SRC), opts)
sub = subset.Subsetter(opts)
sub.populate(text="".join(sorted(chars)))
sub.subset(font)
subset.save_font(font, str(OUT), opts)
hangul = sum(1 for c in chars if "가" <= c <= "힣")
print(f"wrote {OUT.relative_to(ROOT)}  {OUT.stat().st_size // 1024} KB  ({len(chars)} chars, {hangul} hangul)")

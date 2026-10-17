# 아이콘 4종을 만든다: 캐릭터가 사직서 봉투를 들고 있는 그림.
# 캐릭터 격자는 js/sprites.js의 PLAYER를 그대로 읽어 온다(다시 그리지 않는다).
import re, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'js/sprites.js').read_text()
rows = re.findall(r"'([^']{16})'", src.split('const PLAYER = [')[1].split('];')[0])
PAL = {'k': '#2b2833', 's': '#f2c9a0', 'p': '#f0a090', 'e': '#2b2833', 'h': '#3b2f2f',
       'w': '#fbfaf5', 't': '#d9432f', 'b': '#4a5a7a'}
BG = '#2f2b3a'

# 사직서 봉투 (9×7): 흰 봉투에 빨간 도장
ENV = [
    'kkkkkkkkk',
    'kwwwwwwwk',
    'kkwwwwwkk',
    'kwkwwwkwk',
    'kwwkrkwwk',
    'kwwwrwwwk',
    'kkkkkkkkk',
]
EPAL = dict(PAL, r='#d9432f')

def canvas(n, pad):
    # n×n 칸 위에 캐릭터(16×19)와 봉투를 놓는다
    img = Image.new('RGB', (n, n), BG)
    ox, oy = (n - 18) // 2, (n - 19) // 2 + pad
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c != '.': img.putpixel((ox + i, oy + j), tuple(int(PAL[c][k:k + 2], 16) for k in (1, 3, 5)))
    ex, ey = ox + 10, oy + 11
    for j, row in enumerate(ENV):
        for i, c in enumerate(row):
            img.putpixel((ex + i, ey + j), tuple(int(EPAL[c][k:k + 2], 16) for k in (1, 3, 5)))
    return img

def save(img, size, name):
    # 픽셀이 고르게 보이도록 정수 배율로 키우고, 남는 테두리는 배경색으로 채운다
    k = size // img.width
    big = img.resize((img.width * k, img.height * k), Image.NEAREST)
    out = Image.new('RGB', (size, size), BG)
    out.paste(big, ((size - big.width) // 2, (size - big.height) // 2))
    out.save(ROOT / name)
    print(name)

base = canvas(24, 0)
save(base, 180, 'icon-180.png')
save(base, 192, 'icon-192.png')
save(base, 512, 'icon-512.png')
save(base, 1024, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
save(canvas(32, 0), 512, 'icon-512-maskable.png')

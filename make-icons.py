# スタッツ記録アプリ用アイコン生成（棒グラフ＝スタッツのモチーフ、アンバー基調）
from PIL import Image, ImageDraw

BG = (15, 23, 32)        # --bg
AMBER = (255, 179, 0)    # --accent
A_BLUE = (30, 136, 229)  # --a
B_RED = (229, 57, 53)    # --b

def draw_icon(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 背景（角丸 / maskableは全面塗り）
    r = int(size * 0.22)
    if maskable:
        d.rectangle([0, 0, size, size], fill=BG)
    else:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)
    # 安全マージン（maskableは内側80%に収める）
    pad = size * (0.18 if maskable else 0.20)
    inner = size - pad * 2
    # 棒グラフ 3本（青・アンバー・赤）。高さ違い。
    n = 3
    gap = inner * 0.10
    bw = (inner - gap * (n - 1)) / n
    base_y = pad + inner * 0.92
    heights = [0.45, 0.85, 0.62]
    cols = [A_BLUE, AMBER, B_RED]
    br = bw * 0.28
    for i in range(n):
        x0 = pad + i * (bw + gap)
        h = inner * heights[i]
        y0 = base_y - h
        d.rounded_rectangle([x0, y0, x0 + bw, base_y], radius=br, fill=cols[i])
    return img

for size in (192, 512):
    draw_icon(size).save(f"icon-{size}.png")
draw_icon(512, maskable=True).save("icon-512-maskable.png")
# Apple touch（角丸なし・不透明背景が無難）
draw_icon(180).convert("RGB").save("apple-touch-icon.png")
print("icons written")

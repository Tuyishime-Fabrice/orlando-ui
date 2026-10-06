#!/usr/bin/env python3
"""
RE-BANATEX — procedural material plates.

Generates the macro "material plates" used across the site (fibre, stem,
yarn, woven cloth, leather) as JPEGs in assets/img/material/.

These are studio-style stand-ins for real macro photography. When real
RE-BANATEX photographs are available, drop them in with the same filenames
(see assets/img/README.md) and this script is no longer needed.

Requires: numpy, Pillow
Usage:    python3 tools/generate_textures.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "assets" / "img" / "material"
RNG = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers

def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255.0


def blur(a, sigma):
    """Gaussian blur of a 2-D float array via FFT (wraps at edges)."""
    if sigma <= 0:
        return a
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.rfftfreq(w)[None, :]
    g = np.exp(-2 * (np.pi ** 2) * (sigma ** 2) * (fx ** 2 + fy ** 2))
    return np.fft.irfft2(np.fft.rfft2(a) * g, s=a.shape).astype(np.float32)


def noise(h, w, scale, octaves=4, sx=1.0, sy=1.0, seed=None):
    """Fractal value noise in [0,1]. sx/sy stretch the noise (anisotropy)."""
    rng = np.random.default_rng(seed) if seed is not None else RNG
    acc = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        cw = max(2, int(w / (scale * sx) * 2 ** o))
        ch = max(2, int(h / (scale * sy) * 2 ** o))
        small = rng.random((ch, cw)).astype(np.float32)
        img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        acc += amp * (np.asarray(img, np.float32) / 255.0)
        tot += amp
        amp *= 0.5
    acc /= tot
    return (acc - acc.min()) / (np.ptp(acc) + 1e-6)


def ramp(t, stops):
    """Map scalar field t∈[0,1] through colour stops [(pos, '#hex'), ...]."""
    t = np.clip(t, 0, 1)
    pos = np.array([s[0] for s in stops], np.float32)
    cols = np.stack([hexrgb(s[1]) for s in stops])
    out = np.empty(t.shape + (3,), np.float32)
    for c in range(3):
        out[..., c] = np.interp(t, pos, cols[:, c])
    return out


def shade(height, strength=6.0, light=(-0.6, -0.8)):
    """Lambert-ish shading from a height map."""
    gy, gx = np.gradient(height)
    lx, ly = light
    d = -(gx * lx + gy * ly) * strength
    return np.clip(0.78 + d, 0.25, 1.35)


def finish(rgb, grain=0.035, vignette=0.35, warm=0.0, seed=1):
    """Photographic finishing: vignette, grain, gentle tone curve."""
    h, w, _ = rgb.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    rgb = rgb * (1 - vignette * np.clip(r - 0.35, 0, 1) ** 1.6)[..., None]
    rng = np.random.default_rng(seed)
    g = rng.normal(0, grain, (h, w)).astype(np.float32)
    rgb = rgb + g[..., None]
    if warm:
        rgb[..., 0] *= 1 + warm
        rgb[..., 2] *= 1 - warm
    # soft S-curve
    rgb = np.clip(rgb, 0, 1)
    rgb = rgb * rgb * (3 - 2 * rgb) * 0.35 + rgb * 0.65
    return np.clip(rgb, 0, 1)


def save(rgb, name, q=82):
    """Write the full plate plus a 1200px variant for srcset."""
    OUT.mkdir(parents=True, exist_ok=True)
    img = Image.fromarray((rgb * 255).astype(np.uint8))
    img.save(OUT / name, "JPEG", quality=q, optimize=True, progressive=True)
    small = img.copy()
    small.thumbnail((1200, 1200), Image.LANCZOS)
    small.save(OUT / name.replace(".jpg", "-1200.jpg"), "JPEG", quality=q, optimize=True, progressive=True)
    print("wrote", OUT / name, img.size)


# ---------------------------------------------------------------- plates

FIBRE = ["#f1e4c4", "#e6d2a3", "#d8bd84", "#c9a86a", "#b58f52", "#9c7741", "#7e5d33"]


def strands(w, h, n, angle, length, width, palette, alpha, seed, wobble=6.0,
            taper=False, origin=None, bg=None):
    """Draw long fibre strands on an RGBA layer (supersampled 2x)."""
    rng = np.random.default_rng(seed)
    S = 2
    layer = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0) if bg is None else bg)
    d = ImageDraw.Draw(layer, "RGBA")
    for _ in range(n):
        a = np.deg2rad(angle + rng.normal(0, 2.2))
        L = length * rng.uniform(0.6, 1.4) * S
        if origin is None:
            x0 = rng.uniform(-0.3 * w, 1.3 * w) * S
            y0 = rng.uniform(-0.3 * h, 1.3 * h) * S
            x0 -= np.cos(a) * L / 2
            y0 -= np.sin(a) * L / 2
        else:
            dx = rng.normal(0, origin[2])
            x0 = (origin[0] + dx) * S
            y0 = origin[1] * S
            a += np.deg2rad(-dx / origin[2] * 5 + rng.normal(0, 1.5))
        steps = 60
        t = np.linspace(0, 1, steps)
        ph, fr = rng.uniform(0, 6.28), rng.uniform(0.6, 2.2)
        off = np.sin(t * fr * 6.28 + ph) * wobble * S * rng.uniform(0.3, 1.0)
        xs = x0 + np.cos(a) * L * t - np.sin(a) * off
        ys = y0 + np.sin(a) * L * t + np.cos(a) * off
        col = hexrgb(palette[rng.integers(len(palette))]) * rng.uniform(0.85, 1.12)
        col = tuple(int(c) for c in np.clip(col * 255, 0, 255))
        wd = max(1, int(width * rng.uniform(0.3, 1.0) * S))
        pts = list(zip(xs, ys))
        if taper:
            for k in range(steps - 1):
                ww = max(1, int(wd * (1 - t[k] * 0.85)))
                d.line([pts[k], pts[k + 1]], fill=col + (alpha,), width=ww)
        else:
            d.line(pts, fill=col + (alpha,), width=wd, joint="curve")
            # specular highlight on the strand
            hl = tuple(min(255, int(c * 1.22 + 18)) for c in col)
            d.line([(x - S * 0.6, y - S * 0.6) for x, y in pts], fill=hl + (alpha // 3,),
                   width=max(1, wd // 3))
    return layer.resize((w, h), Image.LANCZOS)


def plate_fibre_macro(w=2400, h=1600, name="fibre-macro.jpg"):
    """Hero: raking-light macro of a dense bundle of extracted fibre."""
    base = ramp(noise(h, w, 500, 3, seed=11), [(0, "#1b140d"), (1, "#3a2a19")])
    img = Image.fromarray((base * 255).astype(np.uint8)).convert("RGBA")
    layers = [  # back → front: count, width, alpha, blur, brightness
        (900, 5, 120, 6, 0.55), (1400, 4, 150, 3, 0.72),
        (1800, 3, 190, 1.2, 0.9), (900, 3, 230, 0, 1.05), (260, 5, 240, 0, 1.15),
    ]
    for i, (n, wd, al, bl, br) in enumerate(layers):
        pal = ["#" + "".join(f"{int(min(255, c * 255 * br)):02x}" for c in hexrgb(p)) for p in FIBRE]
        lay = strands(w, h, n, -14, 1500, wd, pal, al, seed=100 + i, wobble=9)
        if bl:
            lay = lay.filter(ImageFilter.GaussianBlur(bl))
        img = Image.alpha_composite(img, lay)
    rgb = np.asarray(img.convert("RGB"), np.float32) / 255.0
    # raking light from upper-left
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    light = 0.62 + 0.55 * np.clip(1 - (xx / w * 0.6 + yy / h * 0.7), 0, 1)
    rgb *= light[..., None]
    save(finish(rgb, 0.03, 0.55, warm=0.03, seed=2), name)


def plate_fibre_hank(w=1600, h=2000, name="fibre-hank.jpg"):
    """Studio: a hank of fibre hanging against natural paper."""
    paper = ramp(noise(h, w, 300, 4, seed=21), [(0, "#e2d7c3"), (1, "#efe7d8")])
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    paper *= (0.86 + 0.14 * (1 - yy / h))[..., None]
    img = Image.fromarray((paper * 255).astype(np.uint8)).convert("RGBA")
    # soft shadow of the hank
    sh = strands(w, h, 500, 90, h * 0.95, 9, ["#5a4630"], 26, seed=5, wobble=14,
                 taper=True, origin=(w * 0.53, h * 0.04, w * 0.07))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(24)))
    for i, (n, al, br) in enumerate([(700, 140, 0.8), (900, 200, 0.95), (500, 235, 1.08)]):
        pal = ["#" + "".join(f"{int(min(255, c * 255 * br)):02x}" for c in hexrgb(p)) for p in FIBRE[1:]]
        lay = strands(w, h, n, 90 + RNG.normal(0, 1), h * 0.9, 4, pal, al, seed=40 + i,
                      wobble=12, taper=True, origin=(w * 0.5, h * 0.02, w * 0.055))
        img = Image.alpha_composite(img, lay)
    # binding cord at the top
    d = ImageDraw.Draw(img)
    # wrapped binding: a solid band of darker fibre with diagonal wraps
    x0, x1, y0, y1 = w * 0.448, w * 0.552, h * 0.022, h * 0.058
    d.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=(120, 92, 56, 255))
    for k in range(9):
        yy0 = y0 + (y1 - y0) * k / 9
        d.line([(x0 + 4, yy0 + 10), (x1 - 4, yy0)], fill=(150, 118, 74, 255), width=5)
    rgb = np.asarray(img.convert("RGB"), np.float32) / 255.0
    save(finish(rgb, 0.022, 0.25, seed=3), name)


def stem_disc(w, h, seed=0, cx=0.5, cy=0.5, rx=0.42, ry=0.40):
    """A freshly cut pseudostem end: wrapped leaf sheaths with rows of air
    chambers. Returns (rgb, mask)."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = (xx - w * cx) / (w * rx), (yy - h * cy) / (h * ry)
    th = np.arctan2(dy, dx)
    wob = rng.uniform(0, 6.28, 2)
    r = np.sqrt(dx ** 2 + dy ** 2) * (1 + 0.025 * np.sin(3 * th + wob[0]) + 0.018 * np.sin(5 * th + wob[1]))
    rings = np.cumsum(np.r_[0.16, rng.uniform(0.06, 0.13, 11)])
    rings = rings / rings[-1]
    # each sheath is an eccentric crescent: boundary radius varies with angle
    B = np.stack([rk * (1 + (0.09 * (1 - rk) + 0.01) * np.cos(th - rng.uniform(0, 6.28)))
                  for rk in rings[:-1]] + [np.full_like(th, 1.0)])
    B = np.sort(B, axis=0)
    k = (r[None] > B).sum(0)
    kc = np.clip(k, 0, len(rings) - 1)
    lo = np.where(k > 0, np.take_along_axis(B, np.clip(k - 1, 0, len(rings) - 1)[None], 0)[0], 0)
    hi = np.take_along_axis(B, kc[None], 0)[0]
    u = np.clip((r - lo) / (hi - lo + 1e-6), 0, 1)  # position inside a sheath
    ncell = (np.clip(k, 1, None) * 9 + 14).astype(np.float32)
    seg = (th / (2 * np.pi) + 0.5) * ncell + k * 0.37
    sept = np.abs(np.sin(np.pi * seg)) ** 0.18
    chamber = np.clip((u - 0.18) / 0.64, 0, 1) * np.clip((0.82 - u) / 0.64, 0, 1) * 4
    chamber = np.clip(chamber, 0, 1) * sept
    wall = np.exp(-((u - 0.0) / 0.06) ** 2) + np.exp(-((u - 1.0) / 0.06) ** 2)
    fib = noise(h, w, max(6, w / 50), 3, seed=seed + 31)
    t = 0.74 - 0.34 * chamber + 0.1 * wall + 0.1 * (fib - 0.5)
    body = ramp(t, [(0, "#7f8a5e"), (0.35, "#b8bd92"), (0.6, "#dcd9b8"), (0.85, "#f1ecd6"), (1, "#fbf8ea")])
    skin = np.clip((r - 0.965) / 0.035, 0, 1)
    skin_col = ramp(noise(h, w, max(6, w / 66), 3, seed=seed + 33), [(0, "#3d3a22"), (0.5, "#5e5a33"), (1, "#7b6c3c")])
    body = body * (1 - skin[..., None]) + skin_col * skin[..., None]
    body *= shade(blur(t + wall * 0.4, 1.5 * w / 2000 + 0.5), 9)[..., None]
    spec = np.clip(noise(h, w, max(10, w / 16), 2, seed=seed + 34) - 0.55, 0, 1) * 1.2 * (r < 0.96)
    body += spec[..., None] * 0.18
    mask = blur((r < 1.0).astype(np.float32), 1.2)
    return np.clip(body, 0, 1), mask


def plate_stem_section(w=2000, h=2000, name="stem-section.jpg"):
    """Studio: a single cut pseudostem on a dark ground."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    body, mask = stem_disc(w, h, seed=7)
    bg = ramp(noise(h, w, 600, 3, seed=35), [(0, "#14110d"), (1, "#26201a")])
    shadow = blur((np.sqrt(((xx - w / 2 - 40) / (w * 0.43)) ** 2 + ((yy - h / 2 - 60) / (h * 0.41)) ** 2) < 1).astype(np.float32), 40)
    bg *= (1 - 0.5 * shadow)[..., None]
    rgb = bg * (1 - mask[..., None]) + body * mask[..., None]
    save(finish(rgb, 0.025, 0.45, seed=4), name)


def plate_stems_stack(w=2400, h=1500, name="stems-stack.jpg"):
    """Collected stems stacked end-on, as delivered by farmers."""
    rng = np.random.default_rng(201)
    rgb = ramp(noise(h, w, 500, 3, seed=202), [(0, "#15110c"), (1, "#2a2117")])
    def pack(seed, rmin, rmax, floor):
        r = np.random.default_rng(seed)
        out = []
        for _ in range(6000):
            x, y = r.uniform(-120, w + 120), r.uniform(-120, h + 120)
            room = min([np.hypot(x - a, y - b) - c + 10 for a, b, c in out] + [r.uniform(rmin, rmax)])
            if room >= floor:
                out.append((x, y, room))
        return out

    def place(discs, dim_range, seed0):
        nonlocal rgb
        for i, (x, y, R) in enumerate(discs):
            size = int(R * 2.3)
            body, mask = stem_disc(size, size, seed=seed0 + i % 40, rx=R / size, ry=R / size * rng.uniform(0.9, 1.0))
            dim = rng.uniform(*dim_range)
            x0, y0 = int(x - size / 2), int(y - size / 2)
            xs, ys = max(0, x0), max(0, y0)
            xe, ye = min(w, x0 + size), min(h, y0 + size)
            if xe <= xs or ye <= ys:
                continue
            b = body[ys - y0:ye - y0, xs - x0:xe - x0] * dim
            m = mask[ys - y0:ye - y0, xs - x0:xe - x0, None]
            rgb[ys:ye, xs:xe] *= (1 - 0.6 * blur(m[..., 0], 14)[..., None])  # contact shadow
            rgb[ys:ye, xs:xe] = rgb[ys:ye, xs:xe] * (1 - m) + b * m

    # a recessed back layer fills the gaps; the front layer sits proud of it
    place(pack(401, 150, 220, 70), (0.22, 0.38), 500)
    place(pack(201, 170, 250, 95), (0.72, 1.0), 300)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rgb *= (0.7 + 0.45 * np.clip(1 - (xx / w * 0.5 + yy / h * 0.6), 0, 1))[..., None]
    save(finish(rgb, 0.028, 0.5, warm=0.02, seed=12), name)


def plate_stem_surface(w=1600, h=2000, name="stem-surface.jpg"):
    """Close-up of the outer pseudostem: long vertical striations."""
    n1 = noise(h, w, 18, 4, sx=1, sy=40, seed=51)
    n2 = noise(h, w, 260, 4, seed=52)
    n3 = noise(h, w, 4, 2, sx=1, sy=60, seed=53)
    t = 0.55 * n1 + 0.3 * n2 + 0.15 * n3
    rgb = ramp(t, [(0, "#2d2b1a"), (0.3, "#4c4b2b"), (0.5, "#6c6739"), (0.7, "#8f8048"), (0.88, "#b59c5d"), (1, "#d2bb80")])
    dry = np.clip((noise(h, w, 380, 3, seed=54) - 0.58) * 4, 0, 1)
    rgb = rgb * (1 - dry[..., None] * 0.6) + ramp(n1, [(0, "#5a4127"), (1, "#a27a4a")]) * dry[..., None] * 0.6
    rgb *= shade(blur(n1 + 0.4 * n3, 1.0), 10, light=(-1, -0.2))[..., None]
    save(finish(rgb, 0.03, 0.4, seed=5), name)


def plate_yarn(w=2000, h=1500, name="yarn.jpg"):
    """Macro: banana-fibre yarns laid side by side, showing the ply twist."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rgb = np.zeros((h, w, 3), np.float32) + hexrgb("#17110b")
    zb = np.full((h, w), -1.0, np.float32)
    y = -40.0
    i = 0
    fuzz = noise(h, w, 3, 2, sx=6, sy=1, seed=61)
    while y < h + 60:
        R = RNG.uniform(52, 70)
        y0 = y + R + 6 * np.sin(xx / RNG.uniform(250, 500) + i)
        u = (yy - y0) / R
        inside = np.abs(u) < 1
        z = np.sqrt(np.clip(1 - u * u, 0, 1))
        pitch = RNG.uniform(70, 95)
        s = xx + u * R * 1.1
        ply = 0.5 + 0.5 * np.cos(2 * np.pi * s / pitch)
        ply = ply ** 0.6
        slub = noise(h, w, 220, 2, seed=70 + i) * 0.25
        t = 0.25 + 0.55 * z * (0.55 + 0.45 * ply) + 0.12 * fuzz + slub - 0.12
        tone = ramp(t, [(0, "#3a2a16"), (0.35, "#8a6a3c"), (0.6, "#c4a46b"), (0.85, "#e7d2a2"), (1, "#f6ead0")])
        tone *= RNG.uniform(0.9, 1.08)
        m = inside & (z > zb)
        rgb[m] = tone[m]
        zb[m] = z[m]
        y += 2 * R - RNG.uniform(4, 14)
        i += 1
    yy2 = yy / h
    rgb *= (0.75 + 0.4 * (1 - yy2))[..., None]
    save(finish(rgb, 0.03, 0.5, warm=0.02, seed=6), name)


def weave(w, h, pw, ph, gap, palette, twill=False, slub=0.25, seed=0, hair=0.12):
    """Height-mapped plain/twill weave with irregular threads."""
    rng = np.random.default_rng(seed)
    # irregular thread boundaries
    def bounds(n_px, pitch):
        widths = pitch * rng.uniform(0.82, 1.18, int(n_px / pitch) + 4)
        edges = np.r_[0, np.cumsum(widths)] - pitch
        return edges
    ex, ey = bounds(w, pw), bounds(h, ph)
    xi = np.searchsorted(ex, np.arange(w)) - 1
    yi = np.searchsorted(ey, np.arange(h)) - 1
    fx = (np.arange(w) - ex[xi]) / (ex[xi + 1] - ex[xi])
    fy = (np.arange(h) - ey[yi]) / (ey[yi + 1] - ey[yi])
    XI, YI = np.meshgrid(xi, yi)
    FX, FY = np.meshgrid(fx, fy)
    # wobble the threads a little
    FX = np.clip(FX + (noise(h, w, 120, 2, seed=seed + 1) - 0.5) * 0.18, 0, 1)
    FY = np.clip(FY + (noise(h, w, 120, 2, seed=seed + 2) - 0.5) * 0.18, 0, 1)
    if twill:
        warp_up = ((XI + YI) % 4) < 2
    else:
        warp_up = ((XI + YI) % 2) == 0
    # thread profiles
    warp_w = np.clip(1 - np.abs(FX - 0.5) * 2 / (1 - gap), 0, 1)
    weft_w = np.clip(1 - np.abs(FY - 0.5) * 2 / (1 - gap), 0, 1)
    warp_prof = np.sqrt(warp_w)
    weft_prof = np.sqrt(weft_w)
    bulge_y = np.sin(np.pi * FY)
    bulge_x = np.sin(np.pi * FX)
    warp_h = warp_prof * np.where(warp_up, 0.6 + 0.4 * bulge_y, 0.25 + 0.2 * (1 - bulge_y))
    weft_h = weft_prof * np.where(~warp_up, 0.6 + 0.4 * bulge_x, 0.25 + 0.2 * (1 - bulge_x))
    warp_h *= warp_w > 0
    weft_h *= weft_w > 0
    top_warp = warp_h >= weft_h
    H = np.maximum(warp_h, weft_h)
    # fibre streaks along each thread direction + slubs
    sv = noise(h, w, 3, 3, sx=1, sy=14, seed=seed + 3)
    sh = noise(h, w, 3, 3, sx=14, sy=1, seed=seed + 4)
    slub_v = noise(h, w, 300, 2, sx=0.2, sy=1.5, seed=seed + 5)
    slub_h = noise(h, w, 300, 2, sx=1.5, sy=0.2, seed=seed + 6)
    thread_tone_v = rng.uniform(-0.08, 0.08, len(ex) + 2)[XI]
    thread_tone_h = rng.uniform(-0.08, 0.08, len(ey) + 2)[YI]
    streak = np.where(top_warp, sv + slub * slub_v + thread_tone_v, sh + slub * slub_h + thread_tone_h)
    t = 0.2 + 0.55 * H + 0.25 * (streak - 0.4)
    rgb = ramp(t, palette)
    ao = blur(H, 6)
    rgb *= (0.55 + 0.6 * np.clip(H - ao + 0.6, 0, 1))[..., None]
    rgb *= shade(blur(H, 1.0), 4)[..., None]
    # loose fibre hairs
    if hair:
        hairs = strands(w, h, int(w * h / 9000), 30, 120, 1, ["#f3e6c6", "#d9c08c"], 90, seed + 9, wobble=10)
        hv = np.asarray(hairs, np.float32) / 255.0
        a = hv[..., 3:4] * hair * 6
        rgb = rgb * (1 - a) + hv[..., :3] * a
    return np.clip(rgb, 0, 1)


def plate_weave_plain(w=2000, h=2000, name="weave-plain.jpg"):
    pal = [(0, "#2a1d10"), (0.3, "#7d6036"), (0.55, "#b89763"), (0.8, "#dcc394"), (1, "#f1e3bf")]
    rgb = weave(w, h, 46, 40, 0.14, pal, seed=80)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rgb *= (0.8 + 0.3 * (1 - (xx / w + yy / h) / 2))[..., None]
    save(finish(rgb, 0.025, 0.4, seed=7), name)


def plate_weave_blend(w=2000, h=1600, name="weave-blend.jpg"):
    """Banana fibre × cotton: finer, softer, lighter twill."""
    pal = [(0, "#4e3f2c"), (0.35, "#ae9a76"), (0.6, "#d9c9a6"), (0.85, "#eee2c8"), (1, "#fbf5e6")]
    rgb = weave(w, h, 22, 20, 0.08, pal, twill=True, slub=0.35, seed=90, hair=0.08)
    save(finish(rgb, 0.025, 0.35, seed=8), name)


def plate_weave_rug(w=2000, h=1600, name="weave-rug.jpg"):
    """Coarse basket weave — rugs and floor textiles."""
    pal = [(0, "#1d150d"), (0.3, "#5f4428"), (0.55, "#9b7849"), (0.8, "#c9a874"), (1, "#e3cb9a")]
    rgb = weave(w, h, 120, 110, 0.1, pal, twill=True, slub=0.5, seed=100, hair=0.15)
    save(finish(rgb, 0.03, 0.45, seed=9), name)


def leather(w, h, seed=111):
    """Banana-fibre based alternative leather: pebble grain, cognac tone."""
    n = noise(h, w, 22, 4, seed=seed)
    warp = noise(h, w, 90, 3, seed=seed + 1)
    cells = np.abs(np.sin((n * 6 + warp * 4) * np.pi))
    crease = 1 - np.clip(cells * 3.2, 0, 1)
    t = 0.55 + 0.25 * (noise(h, w, 400, 3, seed=seed + 2) - 0.5) - 0.35 * crease + 0.1 * n
    rgb = ramp(t, [(0, "#2a160b"), (0.35, "#5a3219"), (0.6, "#8a5329"), (0.85, "#ad7140"), (1, "#c98e58")])
    H = blur(1 - crease, 1.2)
    rgb *= shade(H, 5)[..., None]
    spec = np.clip(H - 0.75, 0, 1) * noise(h, w, 500, 2, seed=seed + 3)
    return np.clip(rgb + spec[..., None] * 0.35, 0, 1)


def plate_leather(w=2000, h=1600, name="leather.jpg"):
    save(finish(leather(w, h), 0.02, 0.45, seed=10), name)


def plate_seam(w=2000, h=1600, name="seam.jpg"):
    """Product detail: woven banana fibre stitched to alternative leather."""
    pal = [(0, "#2a1d10"), (0.3, "#7d6036"), (0.55, "#b89763"), (0.8, "#dcc394"), (1, "#f1e3bf")]
    cloth = weave(w, h, 30, 27, 0.12, pal, seed=140, hair=0.06)
    hide = leather(w, h, seed=150)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    edge = w * 0.62 + 18 * np.sin(yy / 420) + yy * 0.08
    on_leather = blur((xx > edge).astype(np.float32), 1.5)
    # leather sits on top of the cloth: cast shadow onto the weave
    shadow = blur((xx > edge - 26).astype(np.float32), 22) * (1 - on_leather)
    cloth *= (1 - 0.55 * shadow)[..., None]
    # rolled edge highlight on the leather
    rim = np.exp(-((xx - edge - 10) / 9) ** 2)
    hide = hide * (1 + 0.35 * rim[..., None])
    rgb = cloth * (1 - on_leather[..., None]) + hide * on_leather[..., None]
    # stitch line in natural fibre thread
    img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    pitch, L = 46, 30
    for y in np.arange(-40, h + 40, pitch):
        x = w * 0.62 + 18 * np.sin(y / 420) + y * 0.08 + 58
        d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(30, 16, 8))
        d.ellipse([x - 5, y + L - 5, x + 5, y + L + 5], fill=(30, 16, 8))
        d.line([(x + 2, y + 3), (x + 4, y + L + 3)], fill=(40, 24, 12), width=11)
        d.line([(x, y), (x + 1, y + L)], fill=(226, 206, 160), width=9)
        d.line([(x - 2, y + 2), (x - 1, y + L - 4)], fill=(246, 234, 204), width=3)
    rgb = np.asarray(img, np.float32) / 255.0
    rgb *= (0.78 + 0.32 * (1 - (xx / w * 0.4 + yy / h * 0.6)))[..., None]
    save(finish(rgb, 0.022, 0.4, warm=0.02, seed=13), name)


def plate_loom(w=1600, h=2000, name="loom.jpg"):
    """Workshop: taut warp on a handloom, cloth growing beneath the beater."""
    rng = np.random.default_rng(160)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    rgb = ramp(noise(h, w, 400, 3, seed=161), [(0, "#120e0a"), (1, "#2b2219")])
    fell = h * 0.64
    # perspective: warps converge slightly towards the top of the frame
    persp = 0.82 + 0.18 * np.clip(yy / fell, 0, 1)
    xp = (xx - w / 2) / persp + w / 2
    pitch = 26.0
    phase = xp / pitch
    idx = np.floor(phase)
    f = phase - idx
    prof = np.clip(1 - np.abs(f - 0.5) * 2 / 0.62, 0, 1)
    z = np.sqrt(prof)
    tone_jit = rng.uniform(-0.08, 0.08, 400)[(idx.astype(int) % 400)]
    sheen = noise(h, w, 3, 2, sx=1, sy=30, seed=162)
    t = 0.25 + 0.6 * z + tone_jit + 0.12 * (sheen - 0.5)
    warp = ramp(t, [(0, "#3a2a16"), (0.4, "#9c7b48"), (0.7, "#d5ba85"), (1, "#f4e6c4")])
    m = (prof > 0) & (yy < fell)
    rgb[m] = warp[m] * (0.65 + 0.35 * z[m])[..., None]
    # cloth below the fell
    pal = [(0, "#2a1d10"), (0.3, "#7d6036"), (0.55, "#b89763"), (0.8, "#dcc394"), (1, "#f1e3bf")]
    cloth = weave(w, h, pitch, 22, 0.1, pal, seed=163, hair=0.05)
    below = blur((yy >= fell).astype(np.float32), 2)
    rgb = rgb * (1 - below[..., None]) + cloth * below[..., None]
    # the beater bar, in wood
    bar = (yy > h * 0.30) & (yy < h * 0.355)
    grain = noise(h, w, 6, 3, sx=30, sy=1, seed=164)
    wood = ramp(grain, [(0, "#3b2414"), (0.5, "#6b4528"), (1, "#8f6238")])
    by = (yy - h * 0.30) / (h * 0.055)
    wood *= (0.6 + 0.6 * np.sin(np.pi * np.clip(by, 0, 1)))[..., None]
    rgb[bar] = wood[bar]
    rgb *= (1 - 0.5 * blur(((yy > h * 0.355) & (yy < h * 0.37)).astype(np.float32), 8))[..., None]
    # fresh weft at the fell
    pick = np.exp(-((yy - fell + 6) / 7) ** 2)
    rgb = rgb * (1 - pick[..., None] * 0.8) + hexrgb("#ecd7a6") * pick[..., None] * 0.8
    light = 0.6 + 0.6 * np.clip(1 - (xx / w * 0.7 + yy / h * 0.4), 0, 1)
    rgb *= light[..., None]
    save(finish(rgb, 0.03, 0.5, warm=0.03, seed=14), name)


if __name__ == "__main__":
    plate_fibre_macro()
    plate_fibre_hank()
    plate_stem_section()
    plate_stem_surface()
    plate_yarn()
    plate_weave_plain()
    plate_weave_blend()
    plate_weave_rug()
    plate_leather()
    plate_stems_stack()
    plate_seam()
    plate_loom()

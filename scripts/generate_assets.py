#!/usr/bin/env python3
"""Generate the Kinship landing-page images and videos with the Gemini API.

Images: Gemini image model (generateContent). Videos: Veo (predictLongRunning),
animated from the matching key-art image. Everything is written to public/assets.

The API key is read from the GEMINI_API_KEY environment variable, or from a
.env file in the repo root. It is never printed or written anywhere.

Usage:
    python3 scripts/generate_assets.py            # generate anything missing
    python3 scripts/generate_assets.py --force    # regenerate everything
    python3 scripts/generate_assets.py --no-video # images only
"""
import argparse
import base64
import concurrent.futures
import json
import os
import pathlib
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets"
API = "https://generativelanguage.googleapis.com/v1beta"

# Model IDs taken from the Gemini API's own model list (GET /v1beta/models).
IMAGE_MODEL = "gemini-3.1-flash-image"
VIDEO_MODEL = "veo-3.1-fast-generate-preview"
MAX_VIDEOS = 3  # hard cap to keep Veo cost predictable

STYLE = ("Painterly digital illustration, rich but slightly muted colours, soft cinematic lighting, "
         "visible brush texture, character art for a storytelling app. "
         "No text, no lettering, no watermark, no border, no frame.")
PORTRAIT = ("Head-and-shoulders portrait, subject centered and facing the viewer, face in the "
            "upper-middle of the frame, simple softly blurred background. ")

# name -> (aspect ratio, prompt). Portraits are square; key art drives the videos.
IMAGES = {
    "characters/mara": ("1:1", PORTRAIT + "Mara Vex, a woman in her thirties, exiled sky-pirate captain. Windswept dark hair, a thin scar across her left eyebrow, a battered navy officer's coat two sizes too big, cutlass hilt at her shoulder, sly confident half-smile. Behind her: airship rigging and a warm sunset sky."),
    "characters/kenji": ("1:1", PORTRAIT + "Kenji Arata, a Japanese man in his early twenties, star duelist of a magic academy. Sharp jaw, messy black hair, dark academy uniform jacket with silver trim, faint blue magic sparks around one hand, cocky challenging smirk. Background: a tournament arena with banners."),
    "characters/keeper": ("1:1", PORTRAIT + "The Keeper, a weathered old lighthouse keeper in his seventies. Deep wrinkles, white stubble, oilskin coat glistening with rain, holding up a brass lantern that lights his face. Background: dark stormy night, lighthouse beam in the distance."),
    "characters/sorel": ("1:1", PORTRAIT + "Professor Ilya Sorel, a stern man in his fifties, university thesis advisor. Silver-streaked hair, thin wire glasses, dark tweed jacket, raised eyebrow, a secret behind his eyes. Background: an old library with tall bookshelves and a green lamp."),
    "characters/juniper": ("1:1", PORTRAIT + "Juniper Okafor, a Nigerian-British woman in her mid twenties, a chaotic but lovable roommate. Big curly hair with a yellow scarf, paint on her fingers, oversized cardigan, laughing, holding a small potted fern. Background: a cosy cluttered flat full of plants."),
    "characters/rowan": ("1:1", PORTRAIT + "Detective Rowan Hale, a woman in her thirties, 1947 film-noir private detective. Fedora tilted low, trench coat with turned-up collar, red lipstick, wary gaze. Background: rain-slick city street at night, neon sign glow."),
    "characters/seraphine": ("1:1", PORTRAIT + "Seraphine Duval, an elegant vampire heiress in her late twenties. Pale porcelain skin, dark red lips, black hair in an ornate updo, crimson velvet gown, holding a gold masquerade mask beside her face. Background: a candlelit gothic ballroom."),
    "characters/arc7": ("1:1", "ARC-7, a starship's artificial intelligence: a glowing circular amber-and-teal interface eye on a dark metal wall panel, inside a frosted cryosleep bay with rows of pods. Centered composition, no people."),
    "characters/isla": ("1:1", PORTRAIT + "Isla Marrow, a mermaid smuggler woman in her twenties. Sea-green iridescent scales along her cheekbones, wet copper hair, gold hoop earrings, knowing grin. Background: an underwater night market lit by floating lanterns."),
    "characters/tallow": ("1:1", PORTRAIT + "Bosun Tallow, a grizzled quartermaster in his sixties. Grey braided beard, squinting suspicious eyes, knitted cap, rope coiled over his shoulder. Background: wooden airship deck at dusk."),
    "characters/reyes": ("1:1", PORTRAIT + "Captain Reyes, a Latino naval officer in his forties. Crisp white uniform with gold epaulettes, neatly trimmed beard, stern determined stare. Background: an airship bridge window with clouds."),
    "characters/gale": ("1:1", "The Gilded Gale, a patched wooden pirate airship with golden sails and lanterns, sailing between floating islands at sunset. Centered composition, no people visible up close."),
    "characters/lighthouse": ("1:1", "A lone lighthouse on a black rock in a violent storm at night, huge waves crashing, its beam cutting through rain, one warm lit window. Centered composition, no people."),
    "characters/masquerade": ("1:1", "A grand candlelit gothic ballroom during a masquerade ball, masked guests in silhouette, chandeliers, crimson and gold tones. Centered composition."),
    "characters/wren": ("1:1", PORTRAIT + "Wren, an androgynous young adult cartographer in their twenties. Short tousled auburn hair, freckles, round brass goggles pushed up on their head, ink smudge on cheek, rolled maps under one arm, curious bright expression. Background: a drafting table with maps and candlelight."),
    "characters/ash": ("1:1", PORTRAIT + "Captain Ash Mercer, a woman in her fifties, retired starship captain. Close-cropped grey hair, weathered face, worn leather flight jacket with faded insignia, calm dangerous half-smile. Background: a dim spaceship cockpit with starfield."),
    "characters/odile": ("1:1", PORTRAIT + "Odile, an enigmatic clockwork automaton woman. Porcelain face with fine golden seams, glass eyes, a lace collar, visible brass gears at her neck. Background: a Parisian clockmaker's workshop in warm lamplight."),
    # Landing-page key art (also the first frame of each video).
    "keyart/hero-gale": ("16:9", "Wide cinematic establishing shot: the Gilded Gale, a patched wooden airship with golden sails and glowing lanterns, gliding between floating islands with waterfalls at golden hour, soft clouds below, birds in the distance. Calm open sky in the upper third. Epic sense of adventure."),
    "keyart/mara-deck": ("9:16", "Full-length vertical shot of Mara Vex, a sky-pirate captain in her thirties with windswept dark hair, a scar across her left eyebrow and an oversized navy officer's coat, standing at the ship's wheel on the deck of a wooden airship at sunset, golden sails billowing behind her, clouds far below. She looks toward the viewer with a sly half-smile."),
    "keyart/lighthouse-storm": ("16:9", "Wide cinematic shot of a lone lighthouse on a black rock at night in a violent storm, enormous waves exploding against the rocks, heavy rain, the lighthouse beam slicing through the dark, one warm lit window at the top. Moody teal and amber palette."),
    "keyart/writers-desk": ("4:3", "Top-down view of a storyteller's desk: character sketches on cards, an ink pen, a brass compass, a map of floating islands, sealing wax, a cup of tea, warm lamplight. Inviting creative mood."),
    "keyart/personas": ("4:3", "Five ornate theatrical masks hanging on a deep green wall, each a different character: a pirate captain, a detective, a cartographer, a starship captain and a plain silver mask. Soft spotlight, warm and playful."),
}

# Max three clips, each animated from its key-art frame.
VIDEOS = {
    "video/hero-gale": ("keyart/hero-gale", "16:9", "Slow cinematic push-in. The golden-sailed airship glides gently forward between the floating islands, sails ripple, lanterns flicker, clouds drift below, waterfalls spill off the islands, birds wheel past. Keep the painterly illustrated style of the image. One continuous shot, no cuts."),
    "video/mara-deck": ("keyart/mara-deck", "9:16", "The captain stands at the wheel. Wind lifts her hair and the hem of her coat, the golden sails billow behind her, she turns her head slightly toward the camera and her half-smile grows. Subtle slow camera drift. Keep the painterly illustrated style of the image. One continuous shot, no cuts, she does not speak."),
    "video/lighthouse-storm": ("keyart/lighthouse-storm", "16:9", "Locked-off camera. Huge waves crash and spray against the black rock, rain streaks across the frame, the lighthouse beam sweeps slowly across the sea, the warm window flickers. Keep the painterly illustrated style of the image. One continuous shot, no cuts."),
}
NEGATIVE = "text, captions, subtitles, watermark, logo, distorted faces, extra limbs"


def api_key():
    key = os.environ.get("GEMINI_API_KEY")
    env = ROOT / ".env"
    if not key and env.exists():
        for line in env.read_text().splitlines():
            if line.strip().startswith("GEMINI_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        sys.exit("GEMINI_API_KEY is not set (environment or .env).")
    return key


def call(method, url, key, body=None, timeout=300):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def to_webp(png_bytes, dest, max_side):
    try:
        from PIL import Image
    except ImportError:
        dest = dest.with_suffix(".png")
        dest.write_bytes(png_bytes)
        return dest
    import io
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(dest, "WEBP", quality=82)
    return dest


def gen_image(name, aspect, prompt, key, force):
    dest = OUT / f"{name}.webp"
    raw = OUT / "_frames" / f"{name.replace('/', '__')}.png"
    if dest.exists() and not force:
        return name, "exists"
    body = {"contents": [{"parts": [{"text": prompt + " " + STYLE}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}}}
    for attempt in range(3):
        try:
            d = call("POST", f"{API}/models/{IMAGE_MODEL}:generateContent", key, body)
            for part in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in part:
                    png = base64.b64decode(part["inlineData"]["data"])
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    raw.parent.mkdir(parents=True, exist_ok=True)
                    raw.write_bytes(png)  # full-quality frame for Veo
                    to_webp(png, dest, 800 if aspect == "1:1" else 1920)
                    return name, "ok"
        except (urllib.error.URLError, KeyError, IndexError) as e:
            err = type(e).__name__
        time.sleep(3 * (attempt + 1))
    return name, f"failed ({err})"


def gen_video(name, frame, aspect, prompt, key, force):
    dest = OUT / f"{name}.mp4"
    if dest.exists() and not force:
        return name, "exists"
    frame_png = OUT / "_frames" / f"{frame.replace('/', '__')}.png"
    if not frame_png.exists():
        return name, "skipped (missing key-art frame; run images first)"
    body = {
        "instances": [{"prompt": prompt,
                       "image": {"bytesBase64Encoded": base64.b64encode(frame_png.read_bytes()).decode(),
                                 "mimeType": "image/png"}}],
        "parameters": {"aspectRatio": aspect, "durationSeconds": 8, "resolution": "720p",
                       "negativePrompt": NEGATIVE},
    }
    op = call("POST", f"{API}/models/{VIDEO_MODEL}:predictLongRunning", key, body)
    started = time.time()
    while not op.get("done"):
        if time.time() - started > 900:
            return name, "failed (timed out)"
        time.sleep(10)
        op = call("GET", f"{API}/{op['name']}", key)
    if "error" in op:
        return name, f"failed ({op['error'].get('message', 'error')[:120]})"
    samples = op.get("response", {}).get("generateVideoResponse", {}).get("generatedSamples", [])
    if not samples:
        return name, "failed (no video returned; may have been filtered)"
    req = urllib.request.Request(samples[0]["video"]["uri"], headers={"x-goog-api-key": key})
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(req, timeout=300) as r:
        dest.write_bytes(r.read())
    web_ready(dest)
    return name, "ok"


def web_ready(mp4):
    """Drop the audio track (the page plays clips muted) and move the index up front for streaming."""
    if not shutil.which("ffmpeg"):
        return
    tmp = mp4.with_suffix(".tmp.mp4")
    done = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp4), "-an", "-c:v", "copy",
                           "-movflags", "+faststart", str(tmp)])
    if done.returncode == 0:
        tmp.replace(mp4)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="regenerate files that already exist")
    ap.add_argument("--no-video", action="store_true", help="skip Veo clips")
    args = ap.parse_args()
    key = api_key()
    OUT.mkdir(parents=True, exist_ok=True)

    with concurrent.futures.ThreadPoolExecutor(6) as ex:
        jobs = [ex.submit(gen_image, n, a, p, key, args.force) for n, (a, p) in IMAGES.items()]
        for j in concurrent.futures.as_completed(jobs):
            print("image", *j.result(), flush=True)

    if not args.no_video:
        clips = list(VIDEOS.items())[:MAX_VIDEOS]
        with concurrent.futures.ThreadPoolExecutor(MAX_VIDEOS) as ex:
            jobs = [ex.submit(gen_video, n, f, a, p, key, args.force) for n, (f, a, p) in clips]
            for j in concurrent.futures.as_completed(jobs):
                print("video", *j.result(), flush=True)


if __name__ == "__main__":
    main()

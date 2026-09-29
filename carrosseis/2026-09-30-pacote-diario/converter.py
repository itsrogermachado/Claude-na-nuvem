"""Converte os PNG renderizados em JPG (qualidade 93) e apaga os PNG."""
import pathlib
from PIL import Image

for png in sorted(pathlib.Path(__file__).parent.glob("posts/*/*.png")):
    Image.open(png).convert("RGB").save(png.with_suffix(".jpg"), quality=93, optimize=True)
    png.unlink()

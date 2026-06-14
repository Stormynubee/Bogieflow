import glob
import struct

def get_image_size(fname):
    with open(fname, 'rb') as f:
        # Read magic
        data = f.read(2)
        if data != b'\xFF\xD8':
            return None
        while True:
            # Read marker
            marker, = struct.unpack('>H', f.read(2))
            if marker == 0xFFD9 or marker == 0xFFDA:
                break
            # Read length
            length, = struct.unpack('>H', f.read(2))
            # SOF0 (Start of Frame 0) marker is 0xFFC0
            if marker == 0xFFC0:
                f.read(1) # precision
                height, width = struct.unpack('>HH', f.read(4))
                return width, height
            else:
                f.read(length - 2)
    return None

img_files = glob.glob('public/corridor-frames/*.jpg') + glob.glob('dist/corridor-frames/*.jpg')
if img_files:
    size = get_image_size(img_files[0])
    if size:
        w, h = size
        print(f"Image: {img_files[0]}")
        print(f"Width: {w}, Height: {h}")
        print(f"Aspect Ratio: {w/h:.4f}")
    else:
        print("Could not parse image size")
else:
    print("No images found")

const TARGET_IMAGE_BYTES = 3 * 1024;
const MIN_IMAGE_DIMENSION = 96;
const START_IMAGE_DIMENSION = 640;
const QUALITY_STEPS = [0.55, 0.45, 0.35, 0.25, 0.18, 0.12, 0.08, 0.05];

type CompressedImage = {
  file: File;
  originalBytes: number;
  compressedBytes: number;
};

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });
}

async function loadBitmap(file: File) {
  if ("createImageBitmap" in window) {
    return createImageBitmap(file, { imageOrientation: "from-image" });
  }

  const image = new Image();
  const url = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read image"));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getOutputSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function compressImageForUpload(file: File): Promise<CompressedImage> {
  const source = await loadBitmap(file);
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new Error("Image compression is not supported in this browser");
  }

  let bestBlob: Blob | null = null;
  const largestDimension = Math.max(sourceWidth, sourceHeight);

  for (
    let maxDimension = Math.min(START_IMAGE_DIMENSION, largestDimension);
    maxDimension >= MIN_IMAGE_DIMENSION;
    maxDimension = Math.floor(maxDimension * 0.75)
  ) {
    const output = getOutputSize(sourceWidth, sourceHeight, maxDimension);
    canvas.width = output.width;
    canvas.height = output.height;
    context.clearRect(0, 0, output.width, output.height);
    context.drawImage(source, 0, 0, output.width, output.height);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, quality);
      if (!blob) continue;

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= TARGET_IMAGE_BYTES) {
        return {
          file: new File([blob], `${crypto.randomUUID()}.webp`, { type: "image/webp" }),
          originalBytes: file.size,
          compressedBytes: blob.size,
        };
      }
    }
  }

  if (!bestBlob) {
    throw new Error("Could not compress image");
  }

  return {
    file: new File([bestBlob], `${crypto.randomUUID()}.webp`, { type: "image/webp" }),
    originalBytes: file.size,
    compressedBytes: bestBlob.size,
  };
}

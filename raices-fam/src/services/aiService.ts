
// Mock AI Service
// In the future, this will connect to an API like Replicate or OpenAI

// Client-side image sharpening using a convolution kernel
import { downloadFile } from "./driveService";

// Client-side image sharpening using a convolution kernel
export const restoreImage = async (fileId: string): Promise<Blob> => {
    // 1. Download the file securely as a Blob
    const blob = await downloadFile(fileId);
    const imageUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
        const img = new Image();
        // No crossOrigin needed for local blob URLs
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                URL.revokeObjectURL(imageUrl);
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Apply Sharpening Kernel
            // A simple sharpening kernel:
            //  0 -1  0
            // -1  5 -1
            //  0 -1  0
            const sharpenedData = applyConvolution(ctx, imageData, [0, -1, 0, -1, 5, -1, 0, -1, 0]);

            ctx.putImageData(sharpenedData, 0, 0);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(imageUrl);
                if (blob) resolve(blob);
                else reject(new Error("Failed to create blob"));
            }, 'image/png');
        };

        img.onerror = (e) => {
            URL.revokeObjectURL(imageUrl);
            console.error("Error loading image for restoration:", e);
            reject(new Error("Failed to load image"));
        };
    });
};

// Helper function to apply a convolution matrix
const applyConvolution = (ctx: CanvasRenderingContext2D, imageData: ImageData, kernel: number[]) => {
    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    const src = imageData.data;
    const sw = imageData.width;
    const sh = imageData.height;

    // Create output buffer
    const output = ctx.createImageData(sw, sh);
    const dst = output.data;

    for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
            const sy = y;
            const sx = x;
            const dstOff = (y * sw + x) * 4;

            let r = 0, g = 0, b = 0;

            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scy = sy + cy - halfSide;
                    const scx = sx + cx - halfSide;

                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        const srcOff = (scy * sw + scx) * 4;
                        const wt = kernel[cy * side + cx];

                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                    }
                }
            }

            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = src[dstOff + 3]; // Copy alpha
        }
    }
    return output;
};

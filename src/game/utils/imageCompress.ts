export const compressImageFile = (
    file: File,
    options?: { maxWidth?: number; maxHeight?: number; maxLength?: number }
): Promise<string> => {
    const maxWidth = options?.maxWidth ?? 256;
    const maxHeight = options?.maxHeight ?? 256;
    const maxLength = options?.maxLength ?? 350000;

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                canvas.width = Math.max(1, Math.round(width));
                canvas.height = Math.max(1, Math.round(height));
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const attempts = [
                    { width: canvas.width, height: canvas.height, quality: 0.82 },
                    { width: canvas.width, height: canvas.height, quality: 0.72 },
                    { width: Math.max(128, Math.round(canvas.width * 0.85)), height: Math.max(128, Math.round(canvas.height * 0.85)), quality: 0.68 },
                    { width: Math.max(128, Math.round(canvas.width * 0.75)), height: Math.max(128, Math.round(canvas.height * 0.75)), quality: 0.6 },
                ];

                let bestDataUrl = '';
                for (const attempt of attempts) {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = attempt.width;
                    tempCanvas.height = attempt.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    if (!tempCtx) continue;
                    tempCtx.drawImage(img, 0, 0, attempt.width, attempt.height);
                    const dataUrl = tempCanvas.toDataURL('image/jpeg', attempt.quality);
                    if (!bestDataUrl || dataUrl.length < bestDataUrl.length) {
                        bestDataUrl = dataUrl;
                    }
                    if (dataUrl.length <= maxLength) {
                        resolve(dataUrl);
                        return;
                    }
                }

                if (bestDataUrl) {
                    resolve(bestDataUrl);
                } else {
                    reject(new Error('Failed to compress image within bounds'));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

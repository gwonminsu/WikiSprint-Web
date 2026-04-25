type PodoGalleryImage = {
  id: string;
  fileName: string;
  order: number;
  src: string;
};

const podoModules = import.meta.glob<string>('./podo*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

export const podoGalleryImages: PodoGalleryImage[] = Object.entries(podoModules)
  .map(([path, src]) => {
    const fileName = path.split('/').pop() ?? '';
    const orderMatch = fileName.match(/podo(\d+)\.(png|jpe?g)$/i);
    const order = Number(orderMatch?.[1] ?? 0);

    return {
      id: `podo-${order}`,
      fileName,
      order,
      src,
    };
  })
  .sort((firstImage, secondImage) => secondImage.order - firstImage.order);

export type { PodoGalleryImage };

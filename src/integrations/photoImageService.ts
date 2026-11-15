import sharp from 'sharp';
import sharpService from 'astro/assets/services/sharp';

// The default service handles all images except the catalog crops with a chosen focal point.
const photoService: typeof sharpService = {
  ...sharpService,
  async transform(input, options, config, logger) {
    const prefix = 'focus-x:';
    if (!options.position?.startsWith(prefix)) {
      return sharpService.transform(input, options, config, logger);
    }

    const focus = Number(options.position.slice(prefix.length));
    const { width, height } = options;
    if (!Number.isFinite(focus) || focus < 0 || focus > 1 || !width || !height) {
      throw new Error('Encuadre fotográfico inválido');
    }

    const photo = sharp(input, { limitInputPixels: config.service.config.limitInputPixels });
    const source = await photo.metadata();
    const cropWidth = Math.ceil((source.height * width) / height);
    if (source.format !== 'webp' || options.format !== 'webp' || cropWidth > source.width) {
      throw new Error(`El encuadre de ${options.src} requiere un WebP apaisado`);
    }

    const centered = Math.round(source.width * focus - cropWidth / 2);
    const left = Math.max(0, Math.min(centered, source.width - cropWidth));
    const data = await photo
      .extract({ left, top: 0, width: cropWidth, height: source.height })
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: Number(options.quality) || 90, smartSubsample: true })
      .toBuffer();
    return { data, format: 'webp' };
  },
};

export default photoService;

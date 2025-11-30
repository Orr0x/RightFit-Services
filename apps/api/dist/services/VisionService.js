"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vision_1 = require("@google-cloud/vision");
const logger_1 = __importDefault(require("../utils/logger"));
class VisionService {
    client = null;
    isConfigured = false;
    constructor() {
        try {
            // Check if Google Cloud credentials are configured
            if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                this.client = new vision_1.ImageAnnotatorClient();
                this.isConfigured = true;
                logger_1.default.info('Google Cloud Vision API initialized successfully');
            }
            else {
                logger_1.default.warn('Google Cloud Vision API not configured. Photo quality analysis will be skipped.');
                logger_1.default.warn('Set GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS environment variables to enable.');
            }
        }
        catch (error) {
            logger_1.default.error('Failed to initialize Google Cloud Vision API', error);
            this.isConfigured = false;
        }
    }
    /**
     * Analyze photo quality using Google Cloud Vision API
     * @param imageBuffer Buffer containing the image data
     * @returns Quality analysis results
     */
    async analyzePhotoQuality(imageBuffer) {
        // Default response if Vision API is not configured
        if (!this.isConfigured || !this.client) {
            logger_1.default.debug('Vision API not configured, skipping quality analysis');
            return {
                isBlurry: false,
                blurScore: 0,
                brightness: 0.5,
                hasGoodQuality: true,
                warnings: [],
            };
        }
        try {
            const [result] = await this.client.imageProperties({
                image: { content: imageBuffer },
            });
            const imageProperties = result.imagePropertiesAnnotation;
            const warnings = [];
            // Analyze brightness from dominant colors
            let brightness = 0.5; // Default to medium brightness
            if (imageProperties?.dominantColors?.colors && imageProperties.dominantColors.colors.length > 0) {
                const colors = imageProperties.dominantColors.colors;
                const totalPixelFraction = colors.reduce((sum, color) => sum + (color.pixelFraction || 0), 0);
                // Calculate weighted average brightness
                brightness = colors.reduce((sum, color) => {
                    const r = color.color?.red || 0;
                    const g = color.color?.green || 0;
                    const b = color.color?.blue || 0;
                    // Calculate perceived brightness (0-255)
                    const colorBrightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    const weight = (color.pixelFraction || 0) / totalPixelFraction;
                    return sum + colorBrightness * weight;
                }, 0);
                // Check for brightness issues
                if (brightness < 0.25) {
                    warnings.push('Image is too dark. Consider taking photo in better lighting.');
                }
                else if (brightness > 0.85) {
                    warnings.push('Image is overexposed. Consider reducing lighting or camera exposure.');
                }
            }
            // Detect blur using safe search (we'll use a heuristic based on image quality)
            // Note: Vision API doesn't have a direct blur detection, so we'll use safe search confidence as a proxy
            const [safeSearchResult] = await this.client.safeSearchDetection({
                image: { content: imageBuffer },
            });
            // Estimate blur based on detection confidence
            // If safe search has very low confidence, the image might be blurry
            let blurScore = 0;
            let isBlurry = false;
            // We'll use text detection as a proxy for blur - blurry images have trouble detecting text
            const [textResult] = await this.client.textDetection({
                image: { content: imageBuffer },
            });
            if (textResult.textAnnotations && textResult.textAnnotations.length > 0) {
                // If text is detected with low confidence, image might be blurry
                const avgConfidence = textResult.textAnnotations.slice(1).reduce((sum, annotation) => sum + (annotation.confidence || 0), 0) /
                    Math.max(textResult.textAnnotations.length - 1, 1);
                if (avgConfidence < 0.5 && textResult.textAnnotations.length > 2) {
                    blurScore = 1 - avgConfidence;
                    isBlurry = true;
                    warnings.push('Image appears blurry. Hold camera steady and ensure proper focus.');
                }
            }
            // Also check for low-quality indicators from safe search
            const safeSearch = safeSearchResult.safeSearchAnnotation;
            if (safeSearch?.spoof === 'VERY_LIKELY' || safeSearch?.spoof === 'LIKELY') {
                blurScore = Math.max(blurScore, 0.7);
                isBlurry = true;
                warnings.push('Image quality is poor. Retake photo for better results.');
            }
            const hasGoodQuality = !isBlurry && brightness >= 0.25 && brightness <= 0.85;
            logger_1.default.debug('Photo quality analysis completed', {
                isBlurry,
                blurScore,
                brightness,
                hasGoodQuality,
                warningCount: warnings.length,
            });
            return {
                isBlurry,
                blurScore,
                brightness,
                hasGoodQuality,
                warnings,
            };
        }
        catch (error) {
            logger_1.default.error('Error analyzing photo quality with Vision API', error);
            // Return neutral results on error
            return {
                isBlurry: false,
                blurScore: 0,
                brightness: 0.5,
                hasGoodQuality: true,
                warnings: [],
            };
        }
    }
    /**
     * Check if Vision API is configured and available
     */
    isAvailable() {
        return this.isConfigured;
    }
}
exports.default = new VisionService();
//# sourceMappingURL=VisionService.js.map
interface PhotoQualityAnalysis {
    isBlurry: boolean;
    blurScore: number;
    brightness: number;
    hasGoodQuality: boolean;
    warnings: string[];
}
declare class VisionService {
    private client;
    private isConfigured;
    constructor();
    /**
     * Analyze photo quality using Google Cloud Vision API
     * @param imageBuffer Buffer containing the image data
     * @returns Quality analysis results
     */
    analyzePhotoQuality(imageBuffer: Buffer): Promise<PhotoQualityAnalysis>;
    /**
     * Check if Vision API is configured and available
     */
    isAvailable(): boolean;
}
declare const _default: VisionService;
export default _default;
//# sourceMappingURL=VisionService.d.ts.map
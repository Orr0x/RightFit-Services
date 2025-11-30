export interface SendSmsParams {
    to: string;
    message: string;
    metadata?: Record<string, any>;
}
declare class SmsService {
    sendSms(params: SendSmsParams): Promise<boolean>;
    sendWorkOrderAssignmentNotification(params: {
        contractorName: string;
        contractorPhone: string;
        workOrderTitle: string;
        propertyAddress: string;
        priority: string;
        landlordName: string;
        landlordPhone: string;
    }): Promise<boolean>;
    sendWorkOrderUpdateNotification(params: {
        contractorPhone: string;
        workOrderTitle: string;
        propertyAddress: string;
        updateType: string;
        message: string;
    }): Promise<boolean>;
    isConfigured(): boolean;
}
declare const _default: SmsService;
export default _default;
//# sourceMappingURL=SmsService.d.ts.map
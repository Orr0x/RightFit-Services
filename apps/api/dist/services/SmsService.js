"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twilio_1 = __importDefault(require("twilio"));
const logger_1 = __importDefault(require("../utils/logger"));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
// Initialize Twilio client only if credentials are provided
let twilioClient = null;
if (accountSid && authToken) {
    twilioClient = (0, twilio_1.default)(accountSid, authToken);
    logger_1.default.info('Twilio client initialized');
}
else {
    logger_1.default.warn('Twilio credentials not found - SMS notifications disabled');
}
class SmsService {
    async sendSms(params) {
        try {
            // If Twilio is not configured, log and return false
            if (!twilioClient || !fromNumber) {
                logger_1.default.warn('SMS not sent - Twilio not configured', {
                    to: params.to,
                    message: params.message,
                });
                return false;
            }
            // Send SMS
            const message = await twilioClient.messages.create({
                body: params.message,
                from: fromNumber,
                to: params.to,
            });
            logger_1.default.info('SMS sent successfully', {
                sid: message.sid,
                to: params.to,
                status: message.status,
                metadata: params.metadata,
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('SMS send error', {
                error: error.message,
                to: params.to,
                code: error.code,
            });
            return false;
        }
    }
    async sendWorkOrderAssignmentNotification(params) {
        const priorityText = params.priority === 'HIGH' ? 'URGENT: ' : '';
        const message = `${priorityText}New work order: ${params.workOrderTitle} at ${params.propertyAddress}. Contact ${params.landlordName}: ${params.landlordPhone}`;
        return await this.sendSms({
            to: params.contractorPhone,
            message,
            metadata: {
                type: 'work_order_assignment',
                contractor: params.contractorName,
                work_order: params.workOrderTitle,
            },
        });
    }
    async sendWorkOrderUpdateNotification(params) {
        const smsMessage = `Update: ${params.workOrderTitle} at ${params.propertyAddress} - ${params.message}`;
        return await this.sendSms({
            to: params.contractorPhone,
            message: smsMessage,
            metadata: {
                type: 'work_order_update',
                update_type: params.updateType,
                work_order: params.workOrderTitle,
            },
        });
    }
    isConfigured() {
        return twilioClient !== null && fromNumber !== undefined;
    }
}
exports.default = new SmsService();
//# sourceMappingURL=SmsService.js.map
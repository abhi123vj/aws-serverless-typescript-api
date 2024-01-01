"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const InversifyConfig_1 = require("../di/InversifyConfig");
const Types_1 = require("../di/Types");
const ActivationType_1 = require("../types/ActivationType");
const baseHandler = async (event) => {
    try {
        if (!event.body) {
        }
        const params = JSON.parse(event.body);
        return {
            statusCode: http_status_codes_1.StatusCodes.CREATED,
            body: JSON.stringify(params),
        };
    }
    catch (err) {
        return {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({
                error: {
                    message: err.message,
                },
            }),
        };
    }
};
exports.baseHandler = baseHandler;
module.exports.handler = async (event) => {
    try {
        const LicenseKeyService = InversifyConfig_1.default.get(Types_1.TYPES.LicenseKeyService);
        const key = event.pathParameters.key;
        const params = JSON.parse(event.body);
        const response = await LicenseKeyService.activateLicenseKey(key, params);
        var res;
        switch (response.licenseKeyStatus) {
            case ActivationType_1.LicenseKeyStatus.Active:
                res = {
                    success: true,
                    message: "Activated sucessfully",
                    data: {
                        licenseKey: key,
                        bookId: response.selectedBookStatus?.bookId,
                        deviceId: response.selectedBookStatus?.deviceId,
                        dateOfPurchase: response.selectedBookStatus?.dateOfPurchase,
                        expiryDate: response.expiryDate,
                    },
                };
                break;
            case ActivationType_1.LicenseKeyStatus.ActivatedByAnotherDevice:
                res = {
                    success: false,
                    message: "Already Used by Another device",
                };
                break;
            case ActivationType_1.LicenseKeyStatus.DeveloperKey:
                res = {
                    success: true,
                    message: "Activated sucessfully",
                    data: {
                        licenseKey: key,
                        bookId: response.selectedBookStatus?.bookId,
                        deviceId: response.selectedBookStatus?.deviceId,
                        dateOfPurchase: response.selectedBookStatus?.dateOfPurchase,
                        expiryDate: response.expiryDate,
                    },
                };
                break;
            case ActivationType_1.LicenseKeyStatus.Expired:
                res = {
                    success: false,
                    message: "License Key has been expired",
                };
                break;
            default:
                res = {
                    success: false,
                    message: "You have entered an Invalid key",
                };
                break;
        }
        return {
            statusCode: 200,
            body: JSON.stringify(res),
        };
    }
    catch (e) {
        console.log(e);
        res = {
            success: false,
            message: "Something went wrong Try again later",
        };
        return {
            statusCode: 400,
            body: JSON.stringify(res),
        };
    }
};
//# sourceMappingURL=ActivateLicenseKey.js.map
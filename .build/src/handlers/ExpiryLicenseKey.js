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
        const res = await LicenseKeyService.isExpiredLicenseKey(key, params);
        const licenseKeyStatus = res.licenseKeyStatus;
        var response;
        switch (licenseKeyStatus) {
            case ActivationType_1.LicenseKeyStatus.Active:
                response = {
                    sucess: false,
                    message: "Key is still valid",
                    data: {
                        licenseKey: key,
                        productId: params.productId,
                        expiryDate: res.expiryDate,
                    },
                };
                break;
            case ActivationType_1.LicenseKeyStatus.DeveloperKey:
                response = {
                    sucess: false,
                    message: "Key is still valid",
                    data: {
                        licenseKey: key,
                        productId: params.productId,
                        expiryDate: res.expiryDate,
                    },
                };
                break;
            default:
                response = {
                    sucess: true,
                    message: "Key has been expired",
                };
                break;
        }
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    }
    catch (e) {
        console.log(e);
        return {
            statusCode: 400,
            body: JSON.stringify({ e }),
        };
    }
};
//# sourceMappingURL=ExpiryLicenseKey.js.map
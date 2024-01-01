"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const InversifyConfig_1 = require("../di/InversifyConfig");
const Types_1 = require("../di/Types");
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
        const response = await LicenseKeyService.resetLicenseKey(key);
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
//# sourceMappingURL=ResetLicenseKey.js.map
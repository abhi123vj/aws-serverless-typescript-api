"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const Types_1 = require("./Types");
const LicenseKeyService_1 = require("../service/LicenseKeyService");
const LicenseKeyRepository_1 = require("../repository/LicenseKeyRepository");
const container = new inversify_1.Container();
container
    .bind(Types_1.TYPES.LicenseKeyService)
    .to(LicenseKeyService_1.LicenseKeyService);
container
    .bind(Types_1.TYPES.LicenseKeyRepository)
    .to(LicenseKeyRepository_1.LicenseKeyRepository);
exports.default = container;
//# sourceMappingURL=InversifyConfig.js.map
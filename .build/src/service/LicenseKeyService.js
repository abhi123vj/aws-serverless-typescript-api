"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseKeyService = void 0;
const inversify_1 = require("inversify");
const Types_1 = require("../di/Types");
const ActivationType_1 = require("../types/ActivationType");
const moment = require("moment");
let LicenseKeyService = class LicenseKeyService {
    licenseKeyRepository;
    constructor(licenseKeyRepository) {
        this.licenseKeyRepository = licenseKeyRepository;
    }
    async getLicenseKey(key) {
        console.log("getLicenseKey");
        try {
            const license = this.licenseKeyRepository.fetchLicenseKey(key);
            if (license == null) {
            }
            return license;
        }
        catch (err) {
            throw new Error("Get user failed");
        }
    }
    async getBundle(key) {
        console.log("getLicenseKey");
        try {
            const license = this.licenseKeyRepository.fetchBundle(key);
            if (license == null) {
            }
            return license;
        }
        catch (err) {
            throw new Error("Get user failed");
        }
    }
    async isExpiredLicenseKey(key, params) {
        try {
            const license = await this.licenseKeyRepository.fetchLicenseKey(key);
            let isLicenseUpdated = false;
            let licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Invalid;
            let expiryDate = null;
            const splitProductId = params.productId.split('_');
            if (splitProductId.length != 2) {
                return {
                    licenseKeyStatus
                };
            }
            const bookId = splitProductId[1];
            const courseId = splitProductId[0];
            if (license.courseId == courseId) {
                license.bookStatuses.forEach((element) => {
                    if (element.bookId == bookId) {
                        if (element.dateOfPurchase == "dd/mm/yy") {
                            element.dateOfPurchase = moment().format("DD-MM-YYYY");
                        }
                        expiryDate = this.calculateDate365DaysLater(element.dateOfPurchase);
                        if (element.statusOfPurchase == "DEV") {
                            licenseKeyStatus = ActivationType_1.LicenseKeyStatus.DeveloperKey;
                        }
                        else if (element.statusOfPurchase == "N") {
                            licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Inactive;
                        }
                        else if (element.statusOfPurchase == "EXP") {
                            licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Expired;
                        }
                        else if (element.statusOfPurchase == "Y") {
                            const totalDays = this.calculateDaysSincePurchase(element.dateOfPurchase);
                            if (totalDays > 365) {
                                licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Expired;
                                element.statusOfPurchase = "EXP";
                                isLicenseUpdated = true;
                            }
                            else {
                                licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Active;
                            }
                        }
                    }
                });
            }
            if (isLicenseUpdated) {
                await this.licenseKeyRepository.updateLicenseKey(license);
            }
            return { licenseKeyStatus, expiryDate };
        }
        catch (err) {
            throw new Error("Get user failed");
        }
    }
    async activateLicenseKey(key, params) {
        console.log("getLicenseKey");
        try {
            let isLicenseUpdated = false;
            let licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Invalid;
            let selectedBookStatus = null;
            let expiryDate;
            const license = await this.licenseKeyRepository.fetchLicenseKey(key);
            const splitProductId = params.productId.split('_');
            if (splitProductId.length != 2 || license == null) {
                return {
                    licenseKeyStatus
                };
            }
            const bookId = splitProductId[1];
            const courseId = splitProductId[0];
            if (license.courseId == courseId) {
                license.bookStatuses.forEach((element) => {
                    if (element.bookId == bookId) {
                        if (element.statusOfPurchase == "N") {
                            element.statusOfPurchase = "Y";
                            element.deviceId = params.deviceId;
                            element.dateOfPurchase = moment().format("DD-MM-YYYY");
                            isLicenseUpdated = true;
                            licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Active;
                            expiryDate = this.calculateDate365DaysLater(element.dateOfPurchase);
                        }
                        else if (element.statusOfPurchase == "DEV") {
                            element.dateOfPurchase = moment().format("DD-MM-YYYY");
                            licenseKeyStatus = ActivationType_1.LicenseKeyStatus.DeveloperKey;
                            expiryDate = this.calculateDate365DaysLater(element.dateOfPurchase);
                        }
                        else if (element.statusOfPurchase == "Y") {
                            if (element.deviceId != params.deviceId) {
                                licenseKeyStatus = ActivationType_1.LicenseKeyStatus.ActivatedByAnotherDevice;
                            }
                            else {
                                licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Active;
                            }
                        }
                        else if (element.statusOfPurchase == "EXP") {
                            licenseKeyStatus = ActivationType_1.LicenseKeyStatus.Expired;
                        }
                        selectedBookStatus = element;
                    }
                });
            }
            if (isLicenseUpdated) {
                await this.licenseKeyRepository.updateLicenseKey(license);
            }
            return {
                licenseKeyStatus,
                selectedBookStatus,
                expiryDate,
            };
        }
        catch (err) {
            throw new Error("Get user failed");
        }
    }
    async resetLicenseKey(key) {
        console.log("getLicenseKey");
        try {
            const license = await this.licenseKeyRepository.fetchLicenseKey(key);
            if (license == null) {
                return "Invalid Key";
            }
            const isKeyDevKey = license.key.substring(0, 3) == "DEV";
            license.bookStatuses.forEach((element) => {
                element.statusOfPurchase = isKeyDevKey ? "DEV" : "N";
                element.deviceId = "xxxxx";
                element.dateOfPurchase = "dd/mm/yy";
            });
            const licenseUpdated = await this.licenseKeyRepository.updateLicenseKey(license);
            return licenseUpdated;
        }
        catch (err) {
            throw new Error("Get user failed");
        }
    }
    calculateDaysSincePurchase(purchaseDate) {
        const today = moment();
        const purchaseMoment = moment(purchaseDate, "DD-MM-YYYY");
        const daysDifference = today.diff(purchaseMoment, "days");
        return daysDifference;
    }
    calculateDate365DaysLater(dateOfPurchase) {
        const dateOfPurchaseMoment = moment(dateOfPurchase, "DD-MM-YYYY");
        const date365DaysLater = dateOfPurchaseMoment
            .add(365, "days")
            .format("DD-MM-YYYY");
        return date365DaysLater;
    }
};
exports.LicenseKeyService = LicenseKeyService;
exports.LicenseKeyService = LicenseKeyService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(Types_1.TYPES.LicenseKeyRepository)),
    __metadata("design:paramtypes", [Object])
], LicenseKeyService);
//# sourceMappingURL=LicenseKeyService.js.map
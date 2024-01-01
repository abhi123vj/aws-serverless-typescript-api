"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseKeyRepository = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const LicenseKey_1 = require("../models/LicenseKey");
const inversify_1 = require("inversify");
const Resource_1 = require("../models/Resource");
let LicenseKeyRepository = class LicenseKeyRepository {
    async fetchLicenseKey(key) {
        try {
            const client = lib_dynamodb_1.DynamoDBDocument.from(new client_dynamodb_1.DynamoDBClient({}));
            const input = {
                Key: {
                    licence_key: key,
                },
                TableName: "tbl_licence_key",
            };
            const response = await client.get(input);
            console.log(response);
            if (response.Item == null) {
                return null;
            }
            const license = LicenseKey_1.Convert.toLicense(response.Item);
            return license;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async fetchBundle(key) {
        try {
            const client = lib_dynamodb_1.DynamoDBDocument.from(new client_dynamodb_1.DynamoDBClient({}));
            const input = {
                Key: {
                    "userpackage-primekey": key,
                },
                TableName: "user-package-subscription",
            };
            const response = await client.get(input);
            const resource = Resource_1.ResourceConverter.toResource(response.Item.bundle);
            return resource;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async updateLicenseKey(license) {
        try {
            const client = lib_dynamodb_1.DynamoDBDocument.from(new client_dynamodb_1.DynamoDBClient({}));
            const licenseConverted = LicenseKey_1.Convert.licenseToJson(license);
            const input = {
                Item: JSON.parse(licenseConverted),
                TableName: "tbl_licence_key",
            };
            const response = await client.put(input);
            console.log("PutItem response:", response);
            if (response.$metadata.httpStatusCode !== 200) {
                console.error("PutItem operation failed:", response);
            }
            return response;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
};
exports.LicenseKeyRepository = LicenseKeyRepository;
exports.LicenseKeyRepository = LicenseKeyRepository = __decorate([
    (0, inversify_1.injectable)()
], LicenseKeyRepository);
//# sourceMappingURL=LicenseKeyRepository.js.map
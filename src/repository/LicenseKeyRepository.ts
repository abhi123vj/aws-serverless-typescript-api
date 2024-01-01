import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { BookStatus, Convert, License } from "../models/LicenseKey";
import { injectable } from "inversify";
import { ResourceConverter } from "../models/Resource";

export interface ILicenseKeyRepository {
  fetchLicenseKey(key: string): Promise<License | null>;
  fetchBundle(key: string): Promise<any>;
  updateLicenseKey(license: License): Promise<License | null>;
}
@injectable()
export class LicenseKeyRepository implements ILicenseKeyRepository {
  async fetchLicenseKey(key: string): Promise<License | null> {
    try {
      console.log(`going to fetch ${key}`);

      const client = DynamoDBDocument.from(new DynamoDBClient({}));
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
      const license = Convert.toLicense(response.Item);
      return license;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async fetchBundle(key: string): Promise<any> {
    try {
      const client = DynamoDBDocument.from(new DynamoDBClient({}));
      const input = {
        Key: {
          "userpackage-primekey": key,
        },
        TableName: "user-package-subscription",
      };
      const response = await client.get(input);
      //console.log(response);
      const resource = ResourceConverter.toResource(response.Item.bundle);
      return resource;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async updateLicenseKey(license: License): Promise<any> {
    try {
      const client = DynamoDBDocument.from(new DynamoDBClient({}));
      const licenseConverted = Convert.licenseToJson(license);
      const input: PutCommandInput = {
        Item: JSON.parse(licenseConverted),
        TableName: "tbl_licence_key",
      };
      const response = await client.put(input);
      console.log("PutItem response:", response);

      // Or check for errors
      if (response.$metadata.httpStatusCode !== 200) {
        console.error("PutItem operation failed:", response);
      }
      //const license = Convert.toLicense(response.Item);
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

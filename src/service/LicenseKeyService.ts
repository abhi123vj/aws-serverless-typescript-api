import { inject, injectable } from "inversify";
import { TYPES } from "../di/Types";
import { ILicenseKeyRepository } from "../repository/LicenseKeyRepository";
import { ActivationType, LicenseKeyStatus } from "../types/ActivationType";
import { BookStatus, Convert } from "../models/LicenseKey";
import moment = require("moment");

export interface ILicenseKeyService {
  // createUser(orgId: string, payload: User): Promise<User>;
  // getAllUsers(orgId: string): Promise<User[]>;
  getLicenseKey(key: string): any; // Promise<User>;
  getBundle(key: string): any; // Promise<User>;
  resetLicenseKey(key: string): any; // Promise<User>;
  activateLicenseKey(
    key: string,
    params: ActivationType
  ): Promise<{
    licenseKeyStatus: LicenseKeyStatus;
    selectedBookStatus?: BookStatus;
    expiryDate?: string;
  }>; // Promise<User>;
  isExpiredLicenseKey(
    key: string,
    params: ActivationType
  ): Promise<{ licenseKeyStatus: LicenseKeyStatus; expiryDate?: string }>; // Promise<User>;
  // updateUser(orgId: string, payload: User): Promise<number>;
  // deleteUser(orgId: string, id: number): Promise<number | null>;
  // deleteUsers(orgId: string, ids: number[]): Promise<string[]>;
}

@injectable()
export class LicenseKeyService implements ILicenseKeyService {
  public constructor(
    @inject(TYPES.LicenseKeyRepository)
    private readonly licenseKeyRepository: ILicenseKeyRepository
  ) {}
  async getLicenseKey(key: string): Promise<any> {
    console.log("getLicenseKey");
    try {
      const license = this.licenseKeyRepository.fetchLicenseKey(key);
      if (license == null) {
        //! Todo Invalid Key
      }
      return license;
    } catch (err) {
      throw new Error("Get user failed");
    }
  }
  async getBundle(key: string): Promise<any> {
    console.log("getLicenseKey");
    try {
      const license = this.licenseKeyRepository.fetchBundle(key);
      if (license == null) {
        //! Todo Invalid Key
      }
      return license;
    } catch (err) {
      throw new Error("Get user failed");
    }
  }
  async isExpiredLicenseKey(
    key: string,
    params: ActivationType
  ): Promise<{ licenseKeyStatus: LicenseKeyStatus; expiryDate?: string }> {
    try {
      const license = await this.licenseKeyRepository.fetchLicenseKey(key);
      let isLicenseUpdated = false;
      let licenseKeyStatus: LicenseKeyStatus = LicenseKeyStatus.Invalid;
      let expiryDate: string = null;

      const splitProductId: string[] = params.productId.split('_');

      if(splitProductId.length!=2){
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
              licenseKeyStatus = LicenseKeyStatus.DeveloperKey;
            } else if (element.statusOfPurchase == "N") {
              licenseKeyStatus = LicenseKeyStatus.Inactive;
            } else if (element.statusOfPurchase == "EXP") {
              licenseKeyStatus = LicenseKeyStatus.Expired;
            } else if (element.statusOfPurchase == "Y") {
              const totalDays = this.calculateDaysSincePurchase(
                element.dateOfPurchase
              );
              if (totalDays > 365) {
                licenseKeyStatus = LicenseKeyStatus.Expired;
                element.statusOfPurchase = "EXP";
                isLicenseUpdated = true;
              } else {
                licenseKeyStatus = LicenseKeyStatus.Active;
              }
            }
          }
        });
      }

      if (isLicenseUpdated) {
        await this.licenseKeyRepository.updateLicenseKey(license);
      }
      return { licenseKeyStatus, expiryDate };
      // return licenseUpdated;
    } catch (err) {
      throw new Error("Get user failed");
    }
  }
  async activateLicenseKey(
    key: string,
    params: ActivationType
  ): Promise<{
    licenseKeyStatus: LicenseKeyStatus;
    selectedBookStatus?: BookStatus;
    expiryDate?: string;
  }> {
    console.log("getLicenseKey");
    try {
      let isLicenseUpdated = false;
      let licenseKeyStatus: LicenseKeyStatus = LicenseKeyStatus.Invalid;
      let selectedBookStatus: BookStatus = null;
      let expiryDate: string;
      const license = await this.licenseKeyRepository.fetchLicenseKey(key);
      const splitProductId: string[] = params.productId.split('_');

      if(splitProductId.length!=2 ||license==null){
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
              licenseKeyStatus = LicenseKeyStatus.Active;
              expiryDate = this.calculateDate365DaysLater(
                element.dateOfPurchase
              );
            } else if (element.statusOfPurchase == "DEV") {
              element.dateOfPurchase = moment().format("DD-MM-YYYY");
              licenseKeyStatus = LicenseKeyStatus.DeveloperKey;
              expiryDate = this.calculateDate365DaysLater(
                element.dateOfPurchase
              );
            } else if (element.statusOfPurchase == "Y") {
              if (element.deviceId != params.deviceId) {
                licenseKeyStatus = LicenseKeyStatus.ActivatedByAnotherDevice;
              } else {
                licenseKeyStatus = LicenseKeyStatus.Active;
              }
            } else if (element.statusOfPurchase == "EXP") {
              licenseKeyStatus = LicenseKeyStatus.Expired;
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
      // const res = Convert.licenseToJson(license);
      // return isLicenseActivated;
    } catch (err) {
      throw new Error("Get user failed");
    }
  }
  async resetLicenseKey(key: string): Promise<any> {
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

      const licenseUpdated = await this.licenseKeyRepository.updateLicenseKey(
        license
      );

      // const res = Convert.licenseToJson(license);
      return licenseUpdated;
    } catch (err) {
      throw new Error("Get user failed");
    }
  }
  private calculateDaysSincePurchase(purchaseDate: string): number {
    const today = moment();
    const purchaseMoment = moment(purchaseDate, "DD-MM-YYYY");

    const daysDifference = today.diff(purchaseMoment, "days");
    return daysDifference;
  }
  private calculateDate365DaysLater(dateOfPurchase: string): string {
    const dateOfPurchaseMoment = moment(dateOfPurchase, "DD-MM-YYYY");
    const date365DaysLater = dateOfPurchaseMoment
      .add(365, "days")
      .format("DD-MM-YYYY");
    return date365DaysLater;
  }
}

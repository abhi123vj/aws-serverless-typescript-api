export type ActivationType = {
  productId: string;
  key: string;
  deviceId: string;
};

export enum LicenseKeyStatus {
  Active = "Active",
  Inactive = "Inactive",
  ActivatedByAnotherDevice = "ActivatedByAnotherDevice",
  Expired = "Expired",
  DeveloperKey = "DeveloperKey",
  Invalid = "Invalid",
}

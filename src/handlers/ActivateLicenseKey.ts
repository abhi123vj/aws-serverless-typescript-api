import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { StatusCodes } from "http-status-codes";

import container from "../di/InversifyConfig";
import { ILicenseKeyService } from "../service/LicenseKeyService";
import { TYPES } from "../di/Types";
import { ActivationType, LicenseKeyStatus } from "../types/ActivationType";

export const baseHandler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  //const LicenseKeyService = container.get<ILicenseKeyService>(TYPES.LicenseKeyService);

  try {
    if (!event.body) {
      //throw new BadRequestException('Invalid create user payload');
    } 
    //const { orgId } = event.pathParameters ?? {};
    const params = JSON.parse(event.body);
    //const user = await userService.createUser(orgId ?? '0', params);
    return {
      statusCode: StatusCodes.CREATED,
      body: JSON.stringify(params),
    };
  } catch (err) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        error: {
          message: (err as Error).message,
        },
      }),
    };
  }
};
export const handler =  async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Your function logic here
  try {
    const LicenseKeyService = container.get<ILicenseKeyService>(
      TYPES.LicenseKeyService
    );

    const key = event.pathParameters.key;
    const params: ActivationType = JSON.parse(event.body);

    const response = await LicenseKeyService.activateLicenseKey(key, params);
    var res;
    switch (response.licenseKeyStatus) {
      case LicenseKeyStatus.Active:
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
      case LicenseKeyStatus.ActivatedByAnotherDevice:
        res = {
          success: false,
          message: "Already Used by Another device",
        };
        break;
      case LicenseKeyStatus.DeveloperKey:
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
      case LicenseKeyStatus.Expired:
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
  } catch (e) {
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

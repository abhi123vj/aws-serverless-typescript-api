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

    const res = await LicenseKeyService.isExpiredLicenseKey(key, params);
    const licenseKeyStatus = res.licenseKeyStatus;
    var response;
    switch (licenseKeyStatus) {
      case LicenseKeyStatus.Active:
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
      case LicenseKeyStatus.DeveloperKey:
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
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      body: JSON.stringify({ e }),
    };
  }
};

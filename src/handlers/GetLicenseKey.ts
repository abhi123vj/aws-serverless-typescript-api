import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { StatusCodes } from "http-status-codes";

import container from "../di/InversifyConfig";
import { ILicenseKeyService } from "../service/LicenseKeyService";
import { TYPES } from "../di/Types";

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
export const handler  = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Your function logic here
  try {
    const LicenseKeyService = container.get<ILicenseKeyService>(TYPES.LicenseKeyService);
    
    const key = event.pathParameters.key;
    const response = await LicenseKeyService.getLicenseKey(key);


    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (e) {
    console.log(e)
    return {
      statusCode: 400,
      body: JSON.stringify({ e }),
    };
  }
};

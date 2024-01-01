import { Handler } from "aws-lambda/handler";

export const wrapWithMiddlewares = (
    handler: Handler,
    options?: {
        enableCors?: boolean,
    }
): Handler => {
    const {
        enableCors = true, // Default value is true if not provided
    } = options || {};

    // let wrappedHandler = middy(handler);

    // if (enableCors) {
    //     wrappedHandler = wrappedHandler.use(
    //         cors({
    //             origins: [
    //                 'http://localhost:3000',
    //                 'http://192.168.0.181:3000',
    //                 // 'https://dev.sprayzapp.com',
    //                 // 'https://api-docs.sprayzapp.com',
    //                 // 'https://dev-lead.sprayzapp.com',
    //             ],
    //         }),
    //     );
    // }


    // if (roleValidator) {
    //     const authorizationMiddleware = AuthorizationMiddleware.create(
    //         appLogger,
    //         roleValidator,
    //     ).getMiddlewareObject();
    //     wrappedHandler = wrappedHandler.use(authorizationMiddleware);
    // }

    // if (schema) {
    //     const validationMiddleware = EventValidationMiddleware.create(
    //         appLogger,
    //         schema,
    //     ).getMiddlewareObject();
    //     wrappedHandler = wrappedHandler.use(validationMiddleware);
    // }

    return handler
        
};

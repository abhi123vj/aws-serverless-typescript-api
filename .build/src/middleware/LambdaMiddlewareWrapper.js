"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapWithMiddlewares = void 0;
const wrapWithMiddlewares = (handler, options) => {
    const { enableCors = true, } = options || {};
    return handler;
};
exports.wrapWithMiddlewares = wrapWithMiddlewares;
//# sourceMappingURL=LambdaMiddlewareWrapper.js.map
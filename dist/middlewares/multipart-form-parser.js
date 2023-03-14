"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formidable_1 = __importDefault(require("formidable"));
const form = (0, formidable_1.default)({ multiples: true }); // req.files will be an array
/**
 * Parses multipart form data and sets the body and files fields in the request object
 * @param {Request} req request object
 * @param {Response} res response object
 * @param {NextFunction} next calls the next middleware/route
 */
function parseMultipartForm(req, _, next) {
    const contentType = req.headers["content-type"];
    if (contentType && contentType.indexOf("multipart/form-data") !== -1) {
        form.parse(req, (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            // FIXME: this might fail so we should verify that it works
            const request = req;
            // sets fields in request object
            request.body = fields;
            request.files = files;
            next(); // continues to the next middleware/route
        });
    }
    next();
}
exports.default = parseMultipartForm;

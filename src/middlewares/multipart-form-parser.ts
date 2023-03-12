import formidable from "formidable";
import type { Request, Response, NextFunction } from "express";

const form = formidable({ multiples: true }); // req.files will be an array

interface RequestWithFiles extends Request {
	files: formidable.Files;
}

/**
 * Parses multipart form data and sets the body and files fields in the request object
 * @param {Request} req request object
 * @param {Response} res response object
 * @param {NextFunction} next calls the next middleware/route
 */
function parseMultipartForm(req: Request, _: Response, next: NextFunction) {
	const contentType = req.headers["content-type"];

	if (contentType && contentType.indexOf("multipart/form-data") !== -1) {
		form.parse(req, (err, fields, files) => {
			if (err) {
				next(err);
				return;
			}

			// FIXME: this might fail so we should verify that it works
			const request = req as RequestWithFiles;

			// sets fields in request object
			request.body = fields;
			request.files = files;
			next(); // continues to the next middleware/route
		});
	}
	next();
}

export default parseMultipartForm;

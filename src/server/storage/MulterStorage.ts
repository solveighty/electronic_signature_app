import { Request } from "express";

var fs = require("fs");

export function getDestination(
  req: Request,
  file: Express.Multer.File,
  cb: (error?: any, info?: Partial<Express.Multer.File>) => void
) {
  cb(null, "/dev/null");
}

export function SupaBaseStorage(opts: string) {
  this.getDestination = opts.destination || getDestination;
}

SupaBaseStorage.prototype._handleFile = function _handleFile(
  req: Request,
  file: Express.Multer.File,
  cb: (error?: any, info?: Partial<Express.Multer.File>) => void
) {
  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err);

    var outStream = fs.createWriteStream(path);

    file.stream.pipe(outStream);
    outStream.on("error", cb);
    outStream.on("finish", function () {
      cb(null, {
        path: path,
        size: outStream.bytesWritten,
      });
    });
  });
};

SupaBaseStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  fs.unlink(file.path, cb);
};


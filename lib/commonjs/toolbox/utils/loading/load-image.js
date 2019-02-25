"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loadImage(imageUrl) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.addEventListener('load', function () { return resolve(); }, { once: true });
        image.addEventListener('error', function () { return reject(); }, { once: true });
        image.src = imageUrl;
    });
}
exports.loadImage = loadImage;
//# sourceMappingURL=load-image.js.map
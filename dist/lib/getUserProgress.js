"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProgress = void 0;
const getUserProgress = (data, studentNumber) => {
    if (data && data.length !== 0) {
        const target = data.find((item) => item["学籍番号"] === studentNumber);
        if (target) {
            return target;
        }
    }
    return {};
};
exports.getUserProgress = getUserProgress;

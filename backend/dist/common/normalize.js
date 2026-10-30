"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMinutes = exports.Uppercase = exports.Lowercase = exports.Trim = exports.NormalizePhone = exports.normalizePhone = void 0;
exports.slugify = slugify;
exports.vnNow = vnNow;
const class_transformer_1 = require("class-transformer");
const normalizePhone = (v) => v.replace(/[\s.\-]/g, '');
exports.normalizePhone = normalizePhone;
const NormalizePhone = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? (0, exports.normalizePhone)(value) : value));
exports.NormalizePhone = NormalizePhone;
const Trim = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value));
exports.Trim = Trim;
const Lowercase = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));
exports.Lowercase = Lowercase;
const Uppercase = () => (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value));
exports.Uppercase = Uppercase;
function slugify(input) {
    return input
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}
const VN = 'Asia/Ho_Chi_Minh';
function vnNow() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: VN,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}
const addMinutes = (hhmm, minutes) => {
    const [h, m] = hhmm.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
exports.addMinutes = addMinutes;
//# sourceMappingURL=normalize.js.map
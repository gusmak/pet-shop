import { addMinutes, normalizePhone, slugify, vnNow } from './normalize';

describe('normalize helpers', () => {
  it('slugify bỏ dấu tiếng Việt', () => {
    expect(slugify('Tắm spa cao cấp')).toBe('tam-spa-cao-cap');
    expect(slugify('  Đánh răng & Vệ sinh!! ')).toBe('danh-rang-ve-sinh');
    expect(slugify('???')).toBe('');
  });

  it('normalizePhone bỏ khoảng trắng, chấm, gạch', () => {
    expect(normalizePhone('0912 345 678')).toBe('0912345678');
    expect(normalizePhone('0912.345-678')).toBe('0912345678');
  });

  it('addMinutes cộng giờ theo phút', () => {
    expect(addMinutes('10:00', 90)).toBe('11:30');
    expect(addMinutes('18:00', 120)).toBe('20:00');
    expect(addMinutes('08:05', 15)).toBe('08:20');
  });

  it('vnNow trả về ngày/giờ đúng định dạng', () => {
    const now = vnNow();
    expect(now.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(now.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
  });
});

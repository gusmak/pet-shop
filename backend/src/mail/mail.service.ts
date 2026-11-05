import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

// Gửi email qua SMTP (cấu hình bằng biến môi trường SMTP_*). Chưa cấu hình SMTP:
//  - dev: in nội dung (kèm link) ra log để thử luồng;
//  - production: chỉ cảnh báo, KHÔNG ghi link/token vào log.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private get from() {
    return process.env.MAIL_FROM || process.env.SMTP_USER || 'PetShop <no-reply@petshop.vn>';
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;
    const host = process.env.SMTP_HOST;
    if (!host) return null;
    const port = Number(process.env.SMTP_PORT) || 587;
    this.transporter = createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    return this.transporter;
  }

  async send(to: string, subject: string, html: string, text: string) {
    const transporter = this.getTransporter();
    if (!transporter) {
      if (process.env.NODE_ENV === 'production') {
        this.logger.warn(`SMTP chưa cấu hình (SMTP_HOST) — không gửi được email "${subject}" tới ${to}`);
      } else {
        this.logger.log(`[DEV – chưa cấu hình SMTP] Email tới ${to}: ${subject}\n${text}`);
      }
      return;
    }
    await transporter.sendMail({ from: this.from, to, subject, html, text });
  }

  async sendPasswordReset(to: string, name: string, link: string, locale: 'vi' | 'en') {
    const vi = locale === 'vi';
    const subject = vi ? 'Đặt lại mật khẩu PetShop' : 'Reset your PetShop password';
    const text = vi
      ? `Xin chào ${name},\n\nBạn vừa yêu cầu đặt lại mật khẩu. Mở liên kết sau (hiệu lực 1 giờ, dùng một lần):\n${link}\n\nNếu không phải bạn, hãy bỏ qua email này.`
      : `Hello ${name},\n\nYou requested a password reset. Open this link (valid for 1 hour, single use):\n${link}\n\nIf this wasn't you, ignore this email.`;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
    const html = vi
      ? `<p>Xin chào ${esc(name)},</p><p>Bạn vừa yêu cầu đặt lại mật khẩu. Bấm nút bên dưới (hiệu lực <b>1 giờ</b>, chỉ dùng một lần):</p><p><a href="${esc(link)}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Đặt lại mật khẩu</a></p><p>Hoặc mở liên kết: <br>${esc(link)}</p><p style="color:#666">Nếu không phải bạn, hãy bỏ qua email này — mật khẩu sẽ không thay đổi.</p>`
      : `<p>Hello ${esc(name)},</p><p>You requested a password reset. Click below (valid for <b>1 hour</b>, single use):</p><p><a href="${esc(link)}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Reset password</a></p><p>Or open: <br>${esc(link)}</p><p style="color:#666">If this wasn't you, ignore this email — your password stays the same.</p>`;
    await this.send(to, subject, html, text);
  }

  async sendContactNotice(to: string, c: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const esc = (v: string) => v.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
    const text = `Tin nhắn liên hệ mới từ website
Tên: ${c.name}
Email: ${c.email}
SĐT: ${c.phone ?? '-'}
Chủ đề: ${c.subject}

${c.message}`;
    const html = `<p><b>Tin nhắn liên hệ mới từ website</b></p><p>Tên: ${esc(c.name)}<br>Email: ${esc(c.email)}<br>SĐT: ${esc(c.phone ?? '-')}<br>Chủ đề: ${esc(c.subject)}</p><p>${esc(c.message).replace(/\n/g, '<br>')}</p>`;
    await this.send(to, `[PetShop] Liên hệ mới: ${c.subject}`, html, text);
  }

  // Email cho khách khi lịch được nhận / xác nhận / hủy / hoàn thành.
  async sendBookingNotice(
    to: string,
    b: { name: string; code: string; status: string; date: string; time: string; services: string; total: number; storeName: string; storePhone: string },
  ) {
    const esc = (v: string) => v.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
    const headline: Record<string, string> = {
      pending: 'Chúng tôi đã nhận được lịch hẹn của bạn và sẽ xác nhận sớm',
      confirmed: 'Lịch hẹn của bạn đã được xác nhận',
      cancelled: 'Lịch hẹn của bạn đã được hủy',
      completed: 'Cảm ơn bạn đã sử dụng dịch vụ',
    };
    const title = headline[b.status];
    if (!title) return;
    const day = b.date.split('-').reverse().join('/');
    const money = b.total.toLocaleString('vi-VN') + 'đ';
    const text = `Xin chào ${b.name},

${title}.
Mã: ${b.code}
Dịch vụ: ${b.services}
Thời gian: ${b.time} ngày ${day}
Tạm tính: ${money}

${b.storeName} — ${b.storePhone}`;
    const html = `<p>Xin chào ${esc(b.name)},</p><p><b>${title}.</b></p><p>Mã: <b>${esc(b.code)}</b><br>Dịch vụ: ${esc(b.services)}<br>Thời gian: ${b.time} ngày ${day}<br>Tạm tính: ${money}</p><p style="color:#666">${esc(b.storeName)} — ${esc(b.storePhone)}</p>`;
    await this.send(to, `[${b.storeName}] ${title} (${b.code})`, html, text);
  }
}

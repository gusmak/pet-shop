"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/lib/demo";
import { api } from "@/lib/api";
import { Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import GoogleMap from "@/components/GoogleMap";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    if (!DEMO_MODE) {
      const res = await api.post("/api/contact", formData);
      if (res.error) {
        setError(res.error);
        setStatus("idle");
        return;
      }
    }
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setStatus("sent");
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hãy liên hệ để được tư vấn miễn phí về dịch vụ chăm sóc thú cưng
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 transition-colors"
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chủ đề *
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 transition-colors"
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="booking">Đặt lịch dịch vụ</option>
                  <option value="pricing">Hỏi về giá cả</option>
                  <option value="service">Tư vấn dịch vụ</option>
                  <option value="feedback">Góp ý/Phản hồi</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tin nhắn *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 transition-colors"
                  placeholder="Nội dung tin nhắn..."
                />
              </div>

              {status === "sent" && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 24 giờ.
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-lg transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {status === "sending" ? "Đang gửi..." : "Gửi tin nhắn"}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Hotline</h3>
                <a href="tel:0971616634" className="text-primary-600 hover:text-primary-700 font-semibold">
                  0971 616 634
                </a>
                <p className="text-sm text-gray-600 mt-1">Tư vấn 24/7</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Zalo</h3>
                <a
                  href="https://zalo.me/0971616634"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Chat ngay
                </a>
                <p className="text-sm text-gray-600 mt-1">Phản hồi nhanh</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:info@petshop.vn" className="text-green-600 hover:text-green-700 font-semibold">
                  info@petshop.vn
                </a>
                <p className="text-sm text-gray-600 mt-1">Phản hồi trong 24h</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Giờ mở cửa</h3>
                <p className="text-gray-900 font-semibold">8:00 - 20:00</p>
                <p className="text-sm text-gray-600 mt-1">Thứ 2 - Chủ nhật</p>
              </div>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Địa chỉ cửa hàng
              </h2>
              <GoogleMap
                latitude={21.0050}
                longitude={105.8250}
                address="7 Chùa Bộc, Đống Đa, Hà Nội"
                height="400px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Heart, Award, Users, Target, Star, Clock, Phone } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { number: "500+", label: "Khách hàng tin tưởng", icon: Users },
    { number: "1000+", label: "Lượt phục vụ", icon: Heart },
    { number: "5+", label: "Năm kinh nghiệm", icon: Award },
    { number: "4.9/5", label: "Đánh giá trung bình", icon: Star },
  ];

  const team = [
    {
      name: "Nguyễn Văn An",
      role: "Founder & CEO",
      bio: "10 năm kinh nghiệm trong ngành chăm sóc thú cưng. Đã đào tạo hơn 50 groomer chuyên nghiệp.",
      avatar: "👨‍💼",
      specialties: ["Quản lý", "Đào tạo", "Tư vấn"],
    },
    {
      name: "Trần Thị Bình",
      role: "Head Groomer",
      bio: "Chuyên gia cắt tỉa nghệ thuật với 7 năm kinh nghiệm. Đạt giải Nhất cuộc thi Grooming Vietnam 2023.",
      avatar: "👩‍🎨",
      specialties: ["Cắt tỉa nghệ thuật", "Tạo kiểu", "Nhuộm lông"],
    },
    {
      name: "Lê Minh Cường",
      role: "Senior Groomer",
      bio: "5 năm kinh nghiệm, chuyên gia spa và chăm sóc da liễu cho thú cưng.",
      avatar: "👨‍⚕️",
      specialties: ["Spa", "Chăm sóc da", "Trị liệu"],
    },
    {
      name: "Phạm Thị Dung",
      role: "Customer Service Manager",
      bio: "Đảm bảo trải nghiệm tốt nhất cho khách hàng và thú cưng. Luôn tận tâm và chu đáo.",
      avatar: "👩‍💻",
      specialties: ["Dịch vụ khách hàng", "Tư vấn", "Chăm sóc"],
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Yêu thương",
      description: "Chúng tôi yêu thương mọi thú cưng như chính gia đình mình. Mỗi bé đều được chăm sóc tận tâm và chu đáo.",
    },
    {
      icon: Award,
      title: "Chuyên nghiệp",
      description: "Đội ngũ được đào tạo bài bản, cập nhật xu hướng mới nhất. Sản phẩm và dịch vụ đạt chuẩn quốc tế.",
    },
    {
      icon: Target,
      title: "Tận tâm",
      description: "Luôn đặt lợi ích của thú cưng lên hàng đầu. Tư vấn trung thực, dịch vụ chất lượng.",
    },
    {
      icon: Clock,
      title: "Đúng hẹn",
      description: "Tôn trọng thời gian của khách hàng. Luôn hoàn thành dịch vụ đúng hẹn, không để khách chờ đợi.",
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "Khởi đầu",
      description: "Mở cửa hàng đầu tiên với 2 nhân viên và niềm đam mê chăm sóc thú cưng.",
    },
    {
      year: "2020",
      title: "Phát triển",
      description: "Mở rộng dịch vụ, tăng số lượng khách hàng lên 100+ và xây dựng đội ngũ chuyên nghiệp.",
    },
    {
      year: "2022",
      title: "Nâng cấp",
      description: "Đầu tư trang thiết bị hiện đại, nhập khẩu sản phẩm cao cấp từ Mỹ và Nhật Bản.",
    },
    {
      year: "2024",
      title: "Đột phá",
      description: "Đạt 500+ khách hàng thân thiết, nhận giải thưởng 'Dịch vụ Spa Thú Cưng Tốt Nhất 2024'.",
    },
    {
      year: "2026",
      title: "Hiện tại",
      description: "Tiếp tục phát triển, mở rộng dịch vụ và cam kết mang đến trải nghiệm tốt nhất.",
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-20 animate-fadeIn">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🐾 Về Chúng Tôi
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Câu Chuyện <span className="text-primary-600">PetShop</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Từ niềm đam mê chăm sóc thú cưng, chúng tôi đã xây dựng một dịch vụ spa và grooming chuyên nghiệp, 
            nơi mọi thú cưng đều được yêu thương và chăm sóc tận tâm.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </section>

        {/* Our Story */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Hành Trình Của Chúng Tôi
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  PetShop được thành lập vào năm 2019 bởi anh Nguyễn Văn An - một người có niềm đam mê mãnh liệt 
                  với việc chăm sóc thú cưng. Sau nhiều năm làm việc trong ngành, anh nhận thấy nhu cầu về dịch vụ 
                  spa và grooming chuyên nghiệp, chất lượng cao cho thú cưng ngày càng tăng.
                </p>
                <p>
                  Với tâm huyết và kinh nghiệm, anh đã xây dựng PetShop trở thành điểm đến tin cậy của hàng trăm 
                  chủ thú cưng. Chúng tôi không chỉ cung cấp dịch vụ, mà còn mang đến trải nghiệm chăm sóc toàn diện, 
                  nơi mỗi thú cưng đều được đối xử như thành viên trong gia đình.
                </p>
                <p>
                  Sau 5 năm phát triển, PetShop đã phục vụ hơn 1000 lượt khách hàng, xây dựng đội ngũ groomer 
                  chuyên nghiệp và nhận được nhiều giải thưởng uy tín trong ngành.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-300 rounded-3xl aspect-square flex items-center justify-center text-9xl animate-float">
              🐾
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section className="mb-20">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Đội Ngũ Của Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những chuyên gia tận tâm, giàu kinh nghiệm
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 h-48 flex items-center justify-center text-8xl">
                  {member.avatar}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Hành Trình Phát Triển
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những cột mốc quan trọng trong lịch sử PetShop
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200 hidden md:block"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 animate-fadeInUp ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1">
                    <div className={`bg-white rounded-2xl shadow-lg p-8 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                      <div className="text-3xl font-bold text-primary-600 mb-2">{milestone.year}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 bg-primary-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-600 rounded-2xl p-12 text-center text-white animate-fadeInUp">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Hãy Đến Và Trải Nghiệm
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Chúng tôi sẵn sàng chào đón và chăm sóc bé cưng của bạn với tất cả tình yêu thương
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              Đặt lịch ngay
            </Link>
            <a
              href="tel:0971616634"
              className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              0971 616 634
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

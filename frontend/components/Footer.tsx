import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <div>
                <div className="text-xl font-bold text-white">PetShop</div>
                <div className="text-xs text-gray-400">{t("tagline")}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">{t("footer.about")}</p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors font-bold text-sm"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href="https://zalo.me/0971616634"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors"
                aria-label="Zalo"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.services")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services#spa" className="hover:text-primary-500 transition-colors">
                  {t("footer.spa")}
                </Link>
              </li>
              <li>
                <Link href="/services#grooming" className="hover:text-primary-500 transition-colors">
                  {t("footer.grooming")}
                </Link>
              </li>
              <li>
                <Link href="/services#cham-soc" className="hover:text-primary-500 transition-colors">
                  {t("footer.specialCare")}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-primary-500 transition-colors">
                  {t("footer.onlineBooking")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>7 Chùa Bộc, Đống Đa, Hà Nội</span>
              </li>
              <li>
                <a href="tel:0971616634" className="flex items-center gap-2 hover:text-primary-500">
                  <Phone className="w-5 h-5 text-primary-500" />
                  <span>0971 616 634</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@petshop.vn" className="flex items-center gap-2 hover:text-primary-500">
                  <Mail className="w-5 h-5 text-primary-500" />
                  <span>info@petshop.vn</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t("footer.hours")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <span>{t("footer.weekday")}</span>
              </li>
              <li className="pl-7">8:00 - 20:00</li>
              <li className="pl-7 text-gray-400">{t("footer.holiday")}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
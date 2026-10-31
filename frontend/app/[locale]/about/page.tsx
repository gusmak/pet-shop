"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Heart, Award, Users, Target, Star, Clock, Phone } from "lucide-react";

type Stat = { number: string; label: string };
type Value = { title: string; description: string };
type Member = { name: string; role: string; bio: string; specialties: string[] };
type Milestone = { year: string; title: string; description: string };

const STAT_ICONS = [Users, Heart, Award, Star];
const VALUE_ICONS = [Heart, Award, Target, Clock];
const TEAM_EMOJIS = ["👨‍💼", "👩‍🎨", "👨‍⚕️", "👩‍💻"];

export default function AboutPage() {
  const t = useTranslations("aboutPage");

  const stats = (t.raw("stats") as Stat[]).map((s, i) => ({ ...s, Icon: STAT_ICONS[i] }));
  const values = (t.raw("values.items") as Value[]).map((v, i) => ({ ...v, Icon: VALUE_ICONS[i] }));
  const team = (t.raw("team.items") as Member[]).map((m, i) => ({ ...m, avatar: TEAM_EMOJIS[i] }));
  const milestones = t.raw("milestones.items") as Milestone[];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-20 animate-fadeIn">
          <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🐾 {t("badge")}
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t("titlePrefix")} <span className="text-primary-600">{t("titleHighlight")}</span> {t("titleSuffix")}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{t("intro")}</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.Icon;
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">{t("story.title")}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>{t("story.p1")}</p>
                <p>{t("story.p2")}</p>
                <p>{t("story.p3")}</p>
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
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">{t("values.title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("values.description")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.Icon;
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
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">{t("team.title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("team.description")}</p>
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
                      <span key={idx} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
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
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">{t("milestones.title")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("milestones.description")}</p>
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
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              {t("cta.bookNow")}
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
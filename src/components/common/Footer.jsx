import React from "react";
import { Link } from "react-router";
import { Mail, Phone, MapPin, Zap } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import AuroraText from "./AuroraText";

// COLOR SYSTEM
const THEME_COLORS = {
  dark: {
    primary: ["#ef4444", "#f97316"],
    aurora: ["#ef4444", "#f97316", "#fb923c", "#fbbf24", "#ef4444"],
    border: "rgba(239, 68, 68, 0.2)",
  },
  light: {
    primary: ["#3b82f6", "#8b5cf6"],
    aurora: ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#3b82f6"],
    border: "rgba(59, 130, 246, 0.3)",
  },
};

const Footer = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <footer className="relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[0]}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.primary[1]}, transparent)`,
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Main Content */}
      <div
        className="relative z-10 py-16 px-6"
        style={{
          background: isDark
            ? "rgba(0, 0, 0, 0.5)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px)",
          borderTop: `2px solid ${colors.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  key={`logo-icon-${isDark}`}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div key={`aurora-logo-${isDark}`}>
                  <AuroraText
                    text="Trade EV"
                    colors={colors.aurora}
                    className="text-3xl font-black"
                  />
                </div>
              </div>
              <p
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-600"
                } leading-relaxed`}
              >
                Your trusted platform for electric vehicle trading
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3
                key={`contact-title-${isDark}`}
                className="text-2xl font-bold mb-6"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[0]}, ${colors.primary[1]})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li
                  className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                >
                  <Mail
                    className="w-5 h-5 flex-shrink-0 mt-1"
                    style={{ color: colors.primary[0] }}
                  />
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    dagnhieu.work@gmail.com
                  </span>
                </li>
                <li
                  className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                >
                  <Phone
                    className="w-5 h-5 flex-shrink-0 mt-1"
                    style={{ color: colors.primary[1] }}
                  />
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    +84 81 369 8456
                  </span>
                </li>
                <li
                  className="flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                >
                  <MapPin
                    className="w-5 h-5 flex-shrink-0 mt-1"
                    style={{ color: colors.primary[0] }}
                  />
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Lô E2a-7, Đường D1 Khu Công nghệ cao, P.Long Thạnh Mỹ, TP
                    Thủ Đức, TP.HCM
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div
            className="pt-8 text-center"
            style={{
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              © {new Date().getFullYear()} Trade EV. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

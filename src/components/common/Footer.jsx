import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-[#08294d] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-120">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Trade EV</h3>
            <p className="text-gray-300">
              Your trusted platform for electric vehicle trading
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: dagnhieu.work@gmail.com</li>
              <li>Phone: +84 81 369 8456</li>
              <li>Address: Lô E2a-7, Đường D1 Khu Công nghệ cao, P.Long Thạnh Mỹ, TP Thủ Đức, TP.HCM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} Trade EV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

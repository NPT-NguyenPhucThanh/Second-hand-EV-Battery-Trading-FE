// src/features/home/components/PromotionBanner.jsx
import { Link } from "react-router";
import banner from "../../../assets/images/Banner.jpg";
export default function PromotionBanner({
  title = "EV Second-hand Marketplace",
  subtitle = "Your Marketplace for Electric Mobility",
  ctaText = "Post Now!",
  ctaHref = "/listings/new",
}) {
  return (
    <section className="   py-8 mx-auto  mt-8 ">
      <div className=" p-6 md:p-35 text-amber-300 font-semibold relative overflow-hidden">
        <img
          src={banner}
          alt="Promotion Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10">
          <h2
            className="text-2xl md:text-5xl font-bold "
            style={{ WebkitTextStroke: "0.7px black" }}
          >
            {title}
          </h2>
          <p className="mt-2 text-white/90">{subtitle}</p>

          <Link
            to={ctaHref}
            className="inline-block mt-4 rounded-lg bg-white px-4 py-2 font-semibold text-[#007BFF] hover:bg-amber-100"
          >
            {ctaText}
          </Link>
        </div>

        {/* decor */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      </div>
    </section>
  );
}

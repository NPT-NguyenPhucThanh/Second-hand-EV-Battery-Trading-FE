import { Link } from "react-router";
import banner from "../../../assets/images/Banner.jpg";

export default function PromotionBanner({
  title = "EV Second-hand Marketplace",
  subtitle = "Your Marketplace for Electric Mobility",
  ctaText = "Post Now!",
  ctaHref = "/listings/new",
}) {
  return (
    <section className="py-8 mx-auto mt-8 relative overflow-hidden rounded-2xl shadow-lg">
      {/* Import Google Fonts inline */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Exo+2:wght@400;600&family=Rajdhani:wght@500;700&display=swap');
          .font-orbitron { font-family: 'Orbitron', sans-serif; }
          .font-exo2 { font-family: 'Exo 2', sans-serif; }
          .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        `}
      </style>

      <div className="relative p-8 md:p-16 text-left text-white flex flex-col justify-center min-h-[350px] md:min-h-[450px]">
        {/* Background + overlay */}
        <div className="absolute inset-0">
          <img
            src={banner}
            alt="Promotion Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
        </div>

        {/* Nội dung */}
        <div className="relative z-10 max-w-2xl">
          <h2
            className="font-orbitron text-3xl md:text-6xl font-bold tracking-wide drop-shadow-lg"
            style={{ WebkitTextStroke: "0.5px rgba(0,0,0,0.8)" }}
          >
            {title}
          </h2>

          <p className="mt-4 font-exo2 text-lg md:text-2xl text-white/90">
            {subtitle}
          </p>

          <Link
            to={ctaHref}
            className="inline-block mt-6 rounded-lg bg-amber-400 hover:bg-amber-300 px-6 py-3 font-rajdhani text-lg font-semibold text-black shadow-md transition-all duration-200"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}

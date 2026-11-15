import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteLeft } from "react-icons/fa";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { testimonialService } from "../services/db";

/**
 * SIIT — Testimonials slider (Phase 2, DB-backed)
 * Data via testimonialService (dummy now, Supabase later). Featured
 * testimonials appear first. Brand tokens only.
 */

const Stars = ({ rating = 5 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} />);
    else stars.push(<FaRegStar key={i} />);
  }
  return <div className="flex gap-1 text-buttons_2">{stars}</div>;
};

const Card = ({ t }) => (
  <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-white p-8 text-center shadow-xl">
    <FaQuoteLeft className="mb-4 text-3xl text-[#1c3fbd]/20" />
    <p className="mb-6 text-lg italic text-text_color1">&ldquo;{t.review}&rdquo;</p>
    <Stars rating={t.rating} />
    <div className="mt-4 flex items-center gap-3">
      {t.photo_url ? (
        <img src={t.photo_url} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1c3fbd]/10 font-medium text-[#1c3fbd]">
          {t.name?.[0]}
        </div>
      )}
      <div className="text-left">
        <p className="font-bold">{t.name}</p>
        <span className="text-sm text-dark-grey">{t.course}</span>
      </div>
      {t.achievement && (
        <span className="ml-2 rounded-full bg-buttons_1/10 px-3 py-1 text-xs font-medium text-buttons_1">
          {t.achievement}
        </span>
      )}
    </div>
  </div>
);

const Testimonial = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => setItems(await testimonialService.featuredFirst()))();
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-10">
      <h1 className="my-12 text-center text-4xl font-bold md:text-5xl">
        Student <span className="text-buttons_1">Testimonials</span>
      </h1>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        centeredSlides
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper px-2 pb-12"
      >
        {items.map((t) => (
          <SwiperSlide key={t.id} className="pb-4">
            <Card t={t} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonial;

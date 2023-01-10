import React from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";

const BANNER_IMAGES = [
  "beanie.png",
  "chicken hat.png",
  "eyes.png",
  "green pink glasses.png",
  "red glasses.png",
  "hat.png",
  "retro glasses.png",
  "sushi headband.png",
  "tophat.png",
];

const Banner = () => {
  return (
    <div className="h-[88px] bg-checker flex">
      <Marquee
        className="w-full overflow-hidden"
        loop={0}
        gradient={false}
        speed={60}
      >
        {BANNER_IMAGES.map((image, index) => (
          <div
            key={index}
            className="h-full flex items-center justify-center w-full"
          >
            <Image src={`/banner/${image}`} width={80} height={80} alt="logo" />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Banner;

import Image from "next/image";
import Link from "next/link";
import Banner from "../components/Banner";

export default function Home() {
  return (
    <>
      <Banner />
      <div className="flex items-center flex-col gap-10 mt-8">
        <Image
          className="object-cover"
          src={`/logo.png`}
          width={300}
          height={300}
          alt="logo"
        />
        <div className="container w-full sm:w-[600px] flex flex-col md:flex-row text-sm gap-5 font-black text-justify p-3">
          <div>
            Brought to you by Phygitals Inc, RetroGoons is a unique phygital
            collection that caters to both retro enthusiasts and art collectors.
            The collection features a series of nostalgicically-designed
            characters athat pay homage to classic video game and pop culture
            icons. Each character is available as a limited edition 1/1 piece
            with a carefully crafted asset catalogue.
          </div>
          <div>
            {`RetroGoons is not only perfect for those who are looking to add a
              touch of nostalgia to their digital art collection, but is an
              entry to Phygitals Inc ecosystem which is developing in all
              frontiers of the web 3 space. With grants, figurines, 3d models,
              and franchising ventures, you won't want to miss out on the
              hottest upcoming web 3 community in the space right now and for
              the future to come.`}
          </div>
        </div>
        <div className="mb-12">
          <Link href="/mint" className="w-[243px] h-[58px] bg-mintBtnNormal hover:bg-mintBtnHover flex rounded-tl-lg bg-cover bg-center bg-no-repeat transition-all" />
        </div>
      </div>
    </>
  );
}

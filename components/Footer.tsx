import Image from "next/image";

const Footer = () => {
  return (
    <section className="flex justify-center w-full">
      <div>
        <div className="flex flex-row items-center justify-center gap-4">
          <Image
            src={"/Phygitals.png"}
            width={100}
            height={100}
            alt="magiceden"
          />
          <Image
            src={"/magiceden.png"}
            width={100}
            height={100}
            alt="magiceden"
          />
          <Image
            src={"/solanaLogo.png"}
            width={100}
            height={100}
            alt="magiceden"
          />
        </div>
        <div className="text-sm text-center mt-5">
          2022 © Retrogoons by PHYGITAL. All rights reserved. Website under
          construction.
        </div>
      </div>
    </section>
  );
};

export default Footer;

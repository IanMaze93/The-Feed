import Image from "next/image";

export default function Banner() {
  return (
    <header className="w-full bg-black">
      <div className="flex w-full items-center justify-center">
        <Image
          src="/logo-feed.png"
          alt="The Feed logo"
          width={400}
          height={400}
          priority
        />
      </div>

      <div className="h-[2px] w-full bg-[#ff6a00] shadow-[0_1px_5px_rgba(255,106,0,1),0_3px_12px_rgba(255,106,0,0.6)]" />
    </header>
  );
}

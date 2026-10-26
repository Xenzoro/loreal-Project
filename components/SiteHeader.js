import Image from "next/image";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="brand-bar"></div>
      <div className="brand-lockup">
        <Image
          src="/img/loreal-logo.webp"
          alt="L'Oréal logo"
          className="brand-logo"
          width={500}
          height={91}
          loading="eager"
        />
        <p className="eyebrow">Beauty Tech Experience</p>
      </div>

      <div className="hero-copy">
        <p className="section-kicker">Smart Product Advisor</p>
        <h1>Personalized beauty guidance, designed the L&apos;Oréal way.</h1>
        <p className="hero-text">
          Discover tailored recommendations for skincare, haircare, and makeup with Lori,
          your AI-powered L&apos;Oréal assistant.
        </p>
      </div>
    </header>
  );
}

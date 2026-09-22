import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatPrice, products, type Product } from "./data/products";

const WHATSAPP = "917011788839";

function ProductCard({ product }: { product: Product }) {
  const message = encodeURIComponent(`Hi Samarpan, I would love to order the ${product.name} (${formatPrice(product.price)}).`);
  return <article className="product-card">
    <div className="product-art" role="img" aria-label={`${product.name} product artwork`}><span>{product.mark}</span></div>
    <div className="product-info"><h3>{product.name}</h3><div className="product-meta"><span>{formatPrice(product.price)}</span><span>Karwa Chauth</span></div>
      <p>{product.description}</p><a className="button" href={`https://wa.me/${WHATSAPP}?text=${message}`} target="_blank" rel="noreferrer">Order on WhatsApp <span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}

function AnimationPlugin() {
  const shellRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    let frameRequest = 0;
    const sync = () => {
      if (frameRequest) return;
      frameRequest = window.requestAnimationFrame(() => {
        frameRequest = 0;
        const shell = shellRef.current;
        if (!shell || !frame) return;
        const bounds = shell.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - window.innerHeight)));
        frame.contentWindow?.postMessage({ type: "samarpan-scroll", progress }, window.location.origin);
      });
    };
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    frame?.addEventListener("load", sync);
    sync();
    return () => {
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      frame?.removeEventListener("load", sync);
    };
  }, []);

  return <section className="animation-shell" id="karwa-chronicle" aria-label="A Karwa Chauth story" ref={shellRef}>
    <iframe ref={frameRef} id="animation-frame" title="Samarpan Karwa Chauth animation" src="/animation/index.html" loading="eager" />
    <a className="animation-exit" href="#collection">Explore the collection <span aria-hidden="true">↓</span></a>
  </section>;
}

export function Storefront() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerTheme, setHeaderTheme] = useState("dark");

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const sections = [
      { id: "contact", theme: "dark" },
      { id: "story", theme: "blush" },
      { id: "collection", theme: "light" },
    ];
    const updateTheme = () => {
      const probeY = 110;
      const active = sections.find(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return false;
        const bounds = section.getBoundingClientRect();
        return bounds.top <= probeY && bounds.bottom > probeY;
      });
      setHeaderTheme(active?.theme ?? "dark");
    };
    window.addEventListener("scroll", updateTheme, { passive: true });
    window.addEventListener("resize", updateTheme);
    updateTheme();
    return () => { window.removeEventListener("scroll", updateTheme); window.removeEventListener("resize", updateTheme); };
  }, []);

  return <>
    <a className="skip-link" href="#collection">Skip to collection</a>
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`} data-theme={headerTheme}><Link className="brand-lockup" to="/" aria-label="Samarpan home"><span className="header-logo-frame"><img className="header-logo" src="/assets/header_logo.png" alt="Samarpan — Bringing Meaning to Every Celebration" /></span></Link><nav aria-label="Main navigation"><a href="#collection">Collection</a><a href="#story">Our story</a><a href="#contact">Contact</a></nav><a className="header-order" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Order on WhatsApp <span aria-hidden="true">↗</span></a></header>
    <main id="top"><AnimationPlugin />
      <section className="collection section-wrap" id="collection" aria-labelledby="collection-title"><div className="section-heading"><p className="eyebrow dark">The first collection</p><h1 id="collection-title">Made for the moonlit moment.</h1><p>Thoughtful details for the evening of love, laughter and a beautifully held tradition.</p></div><div className="product-grid">{products.map((product) => <ProductCard key={product.name} product={product} />)}</div></section>
      <section className="story section-wrap" id="story" aria-labelledby="story-title"><div className="story-mark" aria-hidden="true">✦</div><div><p className="eyebrow dark">Why Samarpan</p><h2 id="story-title">Handmade with a little more feeling.</h2><p>I am a passionate designer, creating handcrafted gifts that bring meaning to your celebration. Every Samarpan piece is designed to feel personal—from the first glimpse to the moment it becomes part of your ritual.</p><a className="text-link" href="mailto:hello@samarpan.co">Come say hello <span aria-hidden="true">→</span></a></div></section>
      <section className="contact section-wrap" id="contact" aria-labelledby="contact-title"><p className="eyebrow">For your next celebration</p><h2 id="contact-title">Let’s make it memorable.</h2><a className="button button-light" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">Start a conversation <span aria-hidden="true">↗</span></a></section>
    </main>
    <footer className="site-footer"><span>© 2025 Samarpan</span><span>Bringing meaning to every celebration</span><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp us</a></footer>
  </>;
}

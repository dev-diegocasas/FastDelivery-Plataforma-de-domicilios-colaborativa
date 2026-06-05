"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-container-max-width px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-primary text-[28px] sm:text-[32px]">
              local_shipping
            </span>
            <span className="text-headline-lg font-bold text-primary tracking-tight font-headline-lg">
              FastDelivery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="sm">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Registrarse
              </Button>
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <span className="material-symbols-outlined text-[24px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-16 left-4 right-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-4 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-body-md text-on-surface font-body-md hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px] text-secondary">login</span>
                Iniciar sesión
              </div>
            </Link>
            <Link href="/registro" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-body-md text-on-surface font-body-md bg-primary-container/20 text-primary hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Registrarse
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

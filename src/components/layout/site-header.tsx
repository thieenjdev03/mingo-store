"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useCart } from "@/features/cart/cart-context";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useNavCategories } from "@/features/catalog/use-nav-categories";
import { useNavBrands } from "@/features/catalog/use-nav-brands";

const NAV = [
  { key: "products", href: "/products" },
  { key: "brands", href: "/brands" },
  { key: "partnership", href: "/partnership" },
  { key: "about", href: "/about" },
] as const;

const HEADER_ASSETS = {
  logo: "/assets/mingo/home/mingo-logo.png",
  account: "/assets/mingo/home/header-account.svg",
  cart: "/assets/mingo/home/header-cart.svg",
  search: "/assets/mingo/home/header-search.svg",
} as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const { totalQuantity, isDrawerOpen, openDrawer } = useCart();
  const categories = useNavCategories();
  const brands = useNavBrands();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Chỉ trang chủ có banner 100vh nên header đè lên (trong suốt) khi ở đỉnh trang;
  // cuộn xuống thì fill nền trắng. Các trang khác luôn nền trắng như cũ.
  const isHome = pathname === "/";
  // Header trong suốt + chữ trắng khi: đang ở homepage, chưa cuộn, và không mở
  // panel nào (search/menu mở => cần nền trắng để đọc được).
  const overlay = isHome && !scrolled && !searchOpen && !menuOpen;
  // Trên homepage lúc chưa cuộn: ẩn hẳn header (trượt lên trên), chỉ hiện khi cuộn xuống.
  const hidden = isHome && !scrolled && !searchOpen && !menuOpen;
  // Nav key của dropdown đang mở ("products" | "brands"), hoặc null. Chỉ một dropdown mở cùng lúc.
  const [openNav, setOpenNav] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Danh sách item cho dropdown của một nav key (categories cho "products", brands cho "brands").
  // Trả null khi nav key không có dropdown hoặc chưa có dữ liệu -> render link thường.
  const navDropdown = (
    key: string,
  ): { name: string; slug: string; href: string }[] | null => {
    if (key === "products" && categories.length > 0) {
      return categories.map((c) => ({ name: c.name, slug: c.slug, href: `/categories/${c.slug}` }));
    }
    if (key === "brands" && brands.length > 0) {
      return brands.map((b) => ({ name: b.name, slug: b.slug, href: `/brands/${b.slug}` }));
    }
    return null;
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Trên homepage: theo dõi scroll để đổi header trong suốt <-> nền trắng.
  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!menuOpen && !searchOpen && !openNav) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setOpenNav(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen, searchOpen, openNav]);

  // Mobile menu overlays the page — stop the body scrolling underneath it.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    router.push(
      query ? `/products?q=${encodeURIComponent(query)}` : "/products",
    );
    setSearchOpen(false);
  };

  // Màu chữ/icon phụ thuộc chế độ overlay (đè lên banner => trắng cho dễ đọc).
  const navTextClass = overlay ? "text-white" : "text-[#563e2b]";
  const iconInvertClass = overlay ? "[filter:brightness(0)_invert(1)]" : "";

  return (
    <header
      className={`sticky top-0 z-50 h-[64px] transition-[transform,opacity,background-color] duration-300 xl:h-[84px] ${
        overlay ? "bg-transparent text-white" : "bg-white text-[#563e2b]"
      } ${
        hidden ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-4 sm:px-8 xl:block xl:px-0">
        {/* Logo phải nằm gọn trong chiều cao header (căn giữa dọc, không lố xuống dưới)
            để KHÔNG đè lên ảnh banner homepage lúc tải trang. Trên xl header dùng layout
            absolute nên logo giữ absolute + căn giữa qua top-1/2/-translate-y-1/2. */}
        <Link
          href="/"
          aria-label="Mingo — trang chủ"
          className="relative -ml-2 block size-[60px] shrink-0 xl:absolute xl:left-[7.4306%] xl:top-1/2 xl:ml-0 xl:size-[154px] xl:-translate-y-1/2"
        >
          <Image
            src={HEADER_ASSETS.logo}
            alt="Mingo"
            fill
            priority
            sizes="154px"
            className="object-contain"
          />
        </Link>

        <nav
          aria-label={t("mainNav")}
          className="absolute left-[31.8056%] top-[26px] hidden h-8 items-center gap-[60px] xl:flex"
        >
          {NAV.map((item) => {
            const dropdown = navDropdown(item.key);
            const isOpen = openNav === item.key;
            return dropdown ? (
              <div
                key={item.key}
                className="group relative flex h-8 items-center"
                onMouseEnter={() => setOpenNav(item.key)}
                onMouseLeave={() => setOpenNav(null)}
              >
                <Link
                  href={item.href}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onFocus={() => setOpenNav(item.key)}
                  className={`flex h-8 items-center whitespace-nowrap text-[16px] font-bold uppercase leading-6 transition-colors ${
                    isOpen ? "text-primary" : `${navTextClass} group-hover:text-primary`
                  }`}
                >
                  {t(item.key)}
                </Link>
                <NavUnderline active={isOpen} />
                {isOpen ? (
                  // pt-[28px] = khoảng cách từ đáy nav item xuống đáy header, vừa làm cầu hover
                  // vừa cho dropdown mở ngay dưới header (khớp ảnh mockup).
                  <div className="absolute left-0 top-full z-40 pt-[28px]">
                    <ul className="max-h-[70vh] min-w-[240px] overflow-y-auto rounded-b-lg border-x border-b border-border bg-white py-2 shadow-xl">
                      {dropdown.map((entry) => (
                        <li key={entry.slug}>
                          <Link
                            href={entry.href}
                            onClick={() => setOpenNav(null)}
                            className="block px-6 py-3 text-[15px] font-bold uppercase tracking-wide text-[#563e2b] transition-colors hover:bg-blush hover:text-primary"
                          >
                            {entry.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div key={item.key} className="group relative flex h-8 items-center">
                <Link
                  href={item.href}
                  className={`flex h-8 items-center whitespace-nowrap text-[16px] font-bold uppercase leading-6 transition-colors group-hover:text-primary ${navTextClass}`}
                >
                  {t(item.key)}
                </Link>
                <NavUnderline active={false} />
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4 xl:absolute xl:left-[76.7361%] xl:top-1/2 xl:ml-0 xl:-translate-y-1/2 xl:gap-[60px]">
          <Link
            href="/account"
            aria-label={t("account")}
            className="relative hidden size-8 transition-opacity hover:opacity-60 xl:block"
          >
            <Image src={HEADER_ASSETS.account} alt="" fill sizes="32px" className={iconInvertClass} />
          </Link>

          <button
            type="button"
            aria-label={t("cart")}
            aria-expanded={isDrawerOpen}
            onClick={openDrawer}
            className="relative size-6 transition-opacity hover:opacity-60 xl:size-8"
          >
            <Image src={HEADER_ASSETS.cart} alt="" fill sizes="32px" className={iconInvertClass} />
            {totalQuantity > 0 ? (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {totalQuantity}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            aria-label={t("search")}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
            className="relative size-6 transition-opacity hover:opacity-60 xl:size-8"
          >
            <Image src={HEADER_ASSETS.search} alt="" fill sizes="32px" className={iconInvertClass} />
          </button>

          <button
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
            className="transition-colors hover:text-primary xl:hidden"
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="absolute inset-x-0 top-full border-t border-border bg-white p-4 shadow-lg">
          <form
            onSubmit={submitSearch}
            className="mx-auto flex max-w-[720px] items-center gap-3"
          >
            <span className="relative size-5 shrink-0 opacity-60" aria-hidden>
              <Image src={HEADER_ASSETS.search} alt="" fill sizes="20px" />
            </span>
            <input
              ref={searchInputRef}
              type="search"
              name="q"
              aria-label={t("search")}
              placeholder={t("searchPlaceholder")}
              className="h-11 flex-1 border-b border-[#563e2b] bg-transparent px-2 text-base outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Đóng tìm kiếm"
            >
              <X className="size-6" />
            </button>
          </form>
        </div>
      ) : null}

      {menuOpen ? (
        <nav
          aria-label={t("mainNav")}
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-border bg-white px-5 py-6 shadow-lg xl:hidden"
        >
          <div className="mx-auto flex max-w-xl flex-col">
            {NAV.map((item) => {
              const dropdown = navDropdown(item.key);
              return (
                <div key={item.key} className="border-b border-border last:border-0">
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 text-base font-bold uppercase text-[#563e2b] hover:text-primary"
                  >
                    {t(item.key)}
                  </Link>
                  {dropdown ? (
                    <ul className="-mt-1 flex flex-col gap-1 pb-4 pl-4">
                      {dropdown.map((entry) => (
                        <li key={entry.slug}>
                          <Link
                            href={entry.href}
                            onClick={() => setMenuOpen(false)}
                            className="block py-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary"
                          >
                            {entry.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 pt-5 font-semibold text-[#563e2b]"
            >
              <span className="relative size-5">
                <Image src={HEADER_ASSETS.account} alt="" fill sizes="20px" />
              </span>
              {t("account")}
            </Link>
            <div className="pt-5">
              <LocaleSwitcher />
            </div>
          </div>
        </nav>
      ) : null}

      <CartDrawer />
    </header>
  );
}

/**
 * Gạch chân cam dưới nav item, canh ở đáy header (nav item cách đáy header 26px).
 * Hiện khi hover (group-hover) hoặc khi dropdown đang mở (active).
 */
function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -bottom-[26px] left-0 right-0 h-[3px] origin-left rounded-full bg-primary transition-transform duration-200 ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );
}

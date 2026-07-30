"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/features/cart/cart-context";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useNavCategories } from "@/features/catalog/use-nav-categories";

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
  const { totalQuantity, isDrawerOpen, openDrawer } = useCart();
  const categories = useNavCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen && !catalogOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCatalogOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen, searchOpen, catalogOpen]);

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

  return (
    <header className="sticky top-0 z-50 h-[64px] bg-white xl:h-[84px]">
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
          {NAV.map((item) =>
            item.key === "products" && categories.length > 0 ? (
              <div
                key={item.key}
                className="group relative flex h-8 items-center"
                onMouseEnter={() => setCatalogOpen(true)}
                onMouseLeave={() => setCatalogOpen(false)}
              >
                <Link
                  href={item.href}
                  aria-haspopup="true"
                  aria-expanded={catalogOpen}
                  onFocus={() => setCatalogOpen(true)}
                  className={`flex h-8 items-center whitespace-nowrap text-[16px] font-bold uppercase leading-6 transition-colors ${
                    catalogOpen ? "text-primary" : "text-[#563e2b] group-hover:text-primary"
                  }`}
                >
                  {t(item.key)}
                </Link>
                <NavUnderline active={catalogOpen} />
                {catalogOpen ? (
                  // pt-[28px] = khoảng cách từ đáy nav item xuống đáy header, vừa làm cầu hover
                  // vừa cho dropdown mở ngay dưới header (khớp ảnh mockup).
                  <div className="absolute left-0 top-full z-40 pt-[28px]">
                    <ul className="min-w-[240px] rounded-b-lg border-x border-b border-border bg-white py-2 shadow-xl">
                      {categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/categories/${category.slug}`}
                            onClick={() => setCatalogOpen(false)}
                            className="block px-6 py-3 text-[15px] font-bold uppercase tracking-wide text-[#563e2b] transition-colors hover:bg-blush hover:text-primary"
                          >
                            {category.name}
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
                  className="flex h-8 items-center whitespace-nowrap text-[16px] font-bold uppercase leading-6 text-[#563e2b] transition-colors group-hover:text-primary"
                >
                  {t(item.key)}
                </Link>
                <NavUnderline active={false} />
              </div>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4 xl:absolute xl:left-[76.7361%] xl:top-1/2 xl:ml-0 xl:-translate-y-1/2 xl:gap-[60px]">
          <Link
            href="/account"
            aria-label={t("account")}
            className="relative hidden size-8 transition-opacity hover:opacity-60 xl:block"
          >
            <Image src={HEADER_ASSETS.account} alt="" fill sizes="32px" />
          </Link>

          <button
            type="button"
            aria-label={t("cart")}
            aria-expanded={isDrawerOpen}
            onClick={openDrawer}
            className="relative size-6 transition-opacity hover:opacity-60 xl:size-8"
          >
            <Image src={HEADER_ASSETS.cart} alt="" fill sizes="32px" />
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
            <Image src={HEADER_ASSETS.search} alt="" fill sizes="32px" />
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
            {NAV.map((item) => (
              <div key={item.key} className="border-b border-border last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 text-base font-bold uppercase text-[#563e2b] hover:text-primary"
                >
                  {t(item.key)}
                </Link>
                {item.key === "products" && categories.length > 0 ? (
                  <ul className="-mt-1 flex flex-col gap-1 pb-4 pl-4">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="block py-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
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

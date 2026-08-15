"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fCurrencyVND } from "@/lib/format";
import { useCart } from "./cart-context";
import { MeltingIceCreamLoader } from "@/components/ui/melting-ice-cream-loader";

export function CartDrawer() {
  const t = useTranslations("cart");
  const cart = useCart();

  useEffect(() => {
    if (!cart.isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cart.closeDrawer();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [cart.closeDrawer, cart.isDrawerOpen]);

  if (!cart.isDrawerOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={cart.closeDrawer}
      />
      <aside
        aria-label={t("drawerTitle")}
        aria-modal="true"
        role="dialog"
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-foreground">
              {t("drawerTitle")}
            </h2>
          </div>
          <button
            type="button"
            onClick={cart.closeDrawer}
            aria-label={t("close")}
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {cart.errorMessage ? (
          <div
            className="mx-5 mt-4 flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm font-semibold text-destructive sm:mx-7"
            role="alert"
          >
            <span className="flex-1">{cart.errorMessage}</span>
            <button
              type="button"
              onClick={cart.dismissError}
              aria-label={t("dismissError")}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {cart.isLoading ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <MeltingIceCreamLoader label={t("loading")} size="sm" />
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag
              className="mb-5 size-12 text-muted-foreground"
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <h3 className="font-display text-2xl font-bold">
              {t("emptyTitle")}
            </h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
            <Link
              href="/products"
              onClick={cart.closeDrawer}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              {t("continueShopping")}
            </Link>
          </div>
        ) : (
          <>
            <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
              {cart.items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 border-b border-border pb-4 last:border-0"
                >
                  <div className="relative size-20 shrink-0 rounded-lg bg-background">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-2xl">
                        🍦
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 break-words font-sans font-semibold leading-5">
                          {item.product.name}
                        </h3>
                        {item.variantName ? (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {item.variantName}
                          </p>
                        ) : null}
                        {!item.product.available ? (
                          <p className="mt-1 text-xs font-semibold text-destructive">
                            {t("unavailable")}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={cart.isMutating}
                        onClick={() => void cart.removeItem(item.id)}
                        aria-label={`${t("remove")} ${item.product.name}`}
                        className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label={t("decrease")}
                          disabled={cart.isMutating || item.quantity <= 1}
                          onClick={() =>
                            void cart.setQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1.5 disabled:opacity-35"
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={t("increase")}
                          disabled={
                            cart.isMutating ||
                            item.quantity >= item.product.stock
                          }
                          onClick={() =>
                            void cart.setQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1.5 disabled:opacity-35"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="font-bold text-primary">
                        {fCurrencyVND(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer className="relative z-10 mt-auto shrink-0 space-y-3 border-t border-border bg-card px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t("subtotal")}</span>
                <span className="text-primary">
                  {fCurrencyVND(cart.subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("shippingNote")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href="/cart"
                  onClick={cart.closeDrawer}
                  className="inline-flex h-11 items-center justify-center rounded-lg border-2 border-foreground px-4 text-sm font-bold transition-colors hover:bg-accent"
                >
                  {t("viewCart")}
                </Link>
                {cart.valid ? (
                  <Link
                    href="/checkout"
                    onClick={cart.closeDrawer}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-dark"
                  >
                    {t("checkout")}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-lg bg-muted px-4 text-sm font-bold text-muted-foreground"
                  >
                    {t("checkout")}
                  </span>
                )}
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}

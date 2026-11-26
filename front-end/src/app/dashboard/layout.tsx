"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { title: "نمای کلی", href: "/dashboard", icon: "⌂" },
  { title: "همبستگی", href: "/dashboard/correlation", icon: "&" },
  { title: "تحلیل PCA", href: "/dashboard/pca", icon: "^_~" },
  { title: "تحلیل SVD", href: "/dashboard/svd", icon: "~_~" },
  { title: "پیشنهاد محصولات", href: "/dashboard/recommendations", icon: "^_^" },
  { title: "فرصت ها", href: "/dashboard/opportunities", icon: "<O.^>" },
  { title: "ارزیابی نتایج", href: "/dashboard/evaluation", icon: "O.O" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <aside className="fixed right-0 top-0 z-40 flex h-screen w-64 flex-col border-l border-border bg-white p-5">
        <div className="mb-10 px-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-dark">
              Purchase Analysis
            </h1>
            <video
              src="/videos/performance.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-10 h-10 object-contain"
            ></video>
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            تحلیل الگوهای خرید مشتریان
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg ${
                  active
                    ? "active-sidebar"
                    : "text-text-secondary hover:bg-primary-light hover:text-primary"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="mr-64 min-h-screen p-8">{children}</main>
    </div>
  );
}

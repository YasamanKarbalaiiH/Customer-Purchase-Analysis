import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Customer Purchase Analysis
        </h1>

        <p className="text-text-secondary mb-8 leading-8">
          تحلیل الگوهای خرید مشتریان و شناسایی فرصت‌های افزایش فروش با استفاده
          از PCA و SVD
        </p>

        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-primary px-8 py-3 text-white transition hover:bg-primary-dark"
        >
          ورود به داشبورد
        </Link>
      </div>
    </main>
  );
}

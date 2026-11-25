import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-xl text-center">
        <div className="flex flex-col items-center justify-center">
          <video
            src="/videos/performance.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-40 h-40 object-contain mb-5"
          ></video>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Customer Purchase Analysis
          </h1>
        </div>

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

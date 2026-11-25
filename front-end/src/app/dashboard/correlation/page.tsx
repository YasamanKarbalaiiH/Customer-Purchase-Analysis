"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StepThreeData {
  customer_count: number;
  product_count: number;
  centered_matrix_shape: number[];
  covariance_shape: number[];
  correlation_shape: number[];
  max_covariance_difference: number;
  covariance_matches_numpy: boolean;
  top_five_positive_pairs: {
    product_a: string;
    product_b: string;
    covariance: number;
    correlation: number;
  }[];
}

export default function CorrelationPage() {
  const [stepThree, setStepThree] = useState<StepThreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStepThree = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/step-three");

        if (!response.ok) {
          throw new Error("دریافت اطلاعات مرحله سوم ناموفق بود.");
        }

        const result: StepThreeData = await response.json();

        setStepThree(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "خطای نامشخصی رخ داده است.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStepThree();
  }, []);

  return (
    <main className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-text-secondary">
            تحلیل داده‌های خرید مشتریان
          </p>

          <h1 className="text-2xl font-bold text-text-primary">
            تحلیل کوواریانس و همبستگی
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            بررسی ارتباط آماری بین محصولات بر اساس الگوی خرید مشتریان
          </p>
        </div>

        <Link
          href="/dashboard"
          className="w-fit rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-purple-bg"
        >
          بازگشت به داشبورد
        </Link>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-text-secondary">در حال دریافت نتایج تحلیل...</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-bg p-5">
          <h2 className="font-semibold text-red-700">خطا در دریافت اطلاعات</h2>

          <p className="mt-2 text-sm text-red-700">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {stepThree && !loading && !error && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm text-text-secondary">تعداد مشتریان</p>

              <p className="mt-3 text-3xl font-bold text-text-primary">
                {stepThree.customer_count.toLocaleString("en-US")}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                تعداد ردیف‌های ماتریس خرید
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm text-text-secondary">تعداد محصولات</p>

              <p className="mt-3 text-3xl font-bold text-text-primary">
                {stepThree.product_count.toLocaleString("en-US")}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                تعداد ستون‌های ماتریس خرید
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm text-text-secondary">
                ابعاد ماتریس کوواریانس
              </p>

              <p className="mt-3 text-3xl font-bold text-text-primary">
                {stepThree.covariance_shape.join(" × ")}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                ارتباط کوواریانسی بین محصولات
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm text-text-secondary">
                ابعاد ماتریس همبستگی
              </p>

              <p className="mt-3 text-3xl font-bold text-text-primary">
                {stepThree.correlation_shape.join(" × ")}
              </p>

              <p className="mt-2 text-xs text-text-muted">
                شدت ارتباط بین محصولات
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-text-primary">
                بررسی صحت محاسبات کوواریانس
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                مقایسه محاسبه دستی ماتریس کوواریانس با تابع np.cov
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">نتیجه مقایسه</p>

                <p className="mt-2 font-semibold text-text-primary">
                  {stepThree.covariance_matches_numpy
                    ? "محاسبات با خروجی NumPy مطابقت دارند."
                    : "بین دو روش محاسبه اختلاف وجود دارد."}
                </p>
              </div>

              <span
                className={`w-fit rounded-lg px-4 py-2 text-sm font-semibold ${
                  stepThree.covariance_matches_numpy
                    ? "bg-green-bg text-green-800"
                    : "bg-red-bg text-red-700"
                }`}
              >
                {stepThree.covariance_matches_numpy
                  ? "تأیید شده"
                  : "نیازمند بررسی"}
              </span>
            </div>

            <div className="mt-5 rounded-xl bg-purple-bg p-4">
              <p className="text-sm text-text-secondary">
                بیشترین اختلاف بین دو ماتریس
              </p>

              <p className="mt-2 text-xl font-bold text-text-primary">
                {stepThree.max_covariance_difference.toExponential(6)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-text-primary">
                پنج جفت محصول با بیشترین همبستگی مثبت
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                محصولاتی که الگوی خرید آن‌ها بیشترین همراهی مثبت را نشان می‌دهد.
              </p>
            </div>

            {stepThree.top_five_positive_pairs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-162.5 text-right text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="px-4 py-3 font-medium">ردیف</th>
                      <th className="px-4 py-3 font-medium">محصول اول</th>
                      <th className="px-4 py-3 font-medium">محصول دوم</th>
                      <th className="px-4 py-3 font-medium">کوواریانس</th>
                      <th className="px-4 py-3 font-medium">همبستگی</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stepThree.top_five_positive_pairs.map((pair, index) => (
                      <tr
                        key={`${pair.product_a}-${pair.product_b}`}
                        className="border-b border-border last:border-0 hover:bg-purple-bg/40"
                      >
                        <td className="px-4 py-4 text-text-secondary">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 font-medium text-text-primary">
                          {pair.product_a}
                        </td>

                        <td className="px-4 py-4 font-medium text-text-primary">
                          {pair.product_b}
                        </td>

                        <td className="px-4 py-4 text-text-secondary">
                          {pair.covariance.toFixed(6)}
                        </td>

                        <td className="px-4 py-4 font-semibold text-text-primary">
                          {pair.correlation.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl bg-purple-bg p-5 text-center text-sm text-text-secondary">
                جفت محصولی با همبستگی مثبت پیدا نشد.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-text-primary">
              اطلاعات ماتریس مرکز‌شده
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              در این مرحله، میانگین خرید هر محصول از مقادیر ستون مربوط به آن کم
              شده است تا ماتریس برای تحلیل کوواریانس آماده شود.
            </p>

            <div className="mt-4 rounded-xl bg-purple-bg p-4">
              <p className="text-sm text-text-secondary">
                ابعاد ماتریس مرکز‌شده
              </p>

              <p className="mt-2 text-2xl font-bold text-text-primary">
                {stepThree.centered_matrix_shape.join(" × ")}
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

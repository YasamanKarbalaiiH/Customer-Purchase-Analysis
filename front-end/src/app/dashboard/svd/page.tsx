"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SingularValue {
  component: number;
  singular_value: number;
}

interface ReconstructionResult {
  components: number;
  reconstruction_error: number;
  retained_energy: number;
  reconstructed_shape: number[];
}

interface StepFiveData {
  customer_count: number;
  product_count: number;
  original_matrix_shape: number[];
  singular_values_count: number;
  singular_values_data: SingularValue[];
  reconstruction_results: ReconstructionResult[];
  centered_svd_comparison: {
    max_eigenvalue_difference: number;
    comparison_passed: boolean;
  };
}

export default function SVDPage() {
  const [data, setData] = useState<StepFiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8000/api/step-five");

        if (!response.ok) {
          throw new Error("دریافت اطلاعات با مشکل مواجه شد.");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "خطای ناشناخته‌ای رخ داده است.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-text-secondary">
        در حال بارگذاری نتایج تحلیل SVD...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-red-500">
          {error || "اطلاعاتی برای نمایش وجود ندارد."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-primary px-5 py-2 text-white"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const reconstructionResults = data.reconstruction_results ?? [];
  const singularValues = data.singular_values_data ?? [];

  const maxSingularValue = Math.max(
    ...singularValues.slice(0, 20).map((item) => item.singular_value),
    1,
  );

  const maxError = Math.max(
    ...reconstructionResults.map((item) => item.reconstruction_error),
    0.000001,
  );

  return (
    <main className="space-y-8 p-6 md:p-8">
      <div>
        <Link
          href="/dashboard/pca"
          className="text-sm text-text-secondary hover:text-primary"
        >
          ← بازگشت به تحلیل PCA
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-text-primary">
          تحلیل تجزیه مقدار منفرد (SVD)
        </h1>

        <p className="mt-2 text-text-secondary">
          تجزیه ماتریس و بررسی کیفیت بازسازی ماتریس خرید مشتریان
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد کل مشتریان</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {data.customer_count}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد کل محصولات</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {data.product_count}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">ابعاد ماتریس</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {data.original_matrix_shape.join(" × ")}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد مقادیر منفرد</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {data.singular_values_count}
          </h2>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-xl font-bold text-text-primary">
          توزیع مقادیر منفرد
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          نمایش 20 مقدار منفرد اول ماتریس خرید
        </p>

        <div className="mt-6 space-y-4">
          {singularValues.slice(0, 20).map((item) => (
            <div key={item.component}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-text-secondary">
                  مؤلفه {item.component}
                </span>
                <span className="font-medium text-text-primary">
                  {item.singular_value.toFixed(3)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-purple-bg">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${(item.singular_value / maxSingularValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-xl font-bold text-text-primary">بازسازی ماتریس</h2>

        <p className="mt-1 text-sm text-text-secondary">
          مقایسه کیفیت بازسازی با تعداد مؤلفه‌های مختلف
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-150 text-right text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="p-3">تعداد مؤلفه‌ها (k)</th>
                <th className="p-3">خطای بازسازی</th>
                <th className="p-3">انرژی حفظ‌شده</th>
                <th className="p-3">ابعاد ماتریس بازسازی‌شده</th>
              </tr>
            </thead>

            <tbody>
              {reconstructionResults.map((item) => (
                <tr
                  key={item.components}
                  className="border-b border-border last:border-0"
                >
                  <td className="p-3 font-medium text-text-primary">
                    {item.components}
                  </td>

                  <td className="p-3 text-text-secondary">
                    {item.reconstruction_error.toFixed(6)}
                  </td>

                  <td className="p-3 text-text-secondary">
                    {item.retained_energy.toFixed(2)}٪
                  </td>

                  <td className="p-3 text-text-secondary">
                    {item.reconstructed_shape.join(" × ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-xl font-bold text-text-primary">
          نمودار مقایسه خطای بازسازی
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          تغییر میزان خطای بازسازی با افزایش تعداد مؤلفه‌ها
        </p>

        <div className="mt-6 space-y-5">
          {reconstructionResults.map((item) => (
            <div key={item.components}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-text-secondary">
                  {item.components} مؤلفه
                </span>

                <span className="font-medium text-text-primary">
                  {item.reconstruction_error.toFixed(6)}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-purple-bg">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${(item.reconstruction_error / maxError) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-xl font-bold text-text-primary">
          مقایسه PCA و SVD
        </h2>

        <p className="mt-2 text-sm leading-7 text-text-secondary">
          در این بخش، مقادیر ویژه ماتریس کوواریانس با مربع مقادیر منفرد ماتریس
          مرکزدهی‌شده تقسیم بر تعداد مشتریان منهای یک مقایسه می‌شوند. این دو
          مقدار از نظر ریاضی باید برابر باشند.
        </p>

        <div className="mt-5 rounded-xl bg-purple-bg p-5">
          <p className="text-sm text-text-secondary">بیشترین اختلاف عددی</p>

          <p className="mt-2 text-2xl font-bold text-text-primary">
            {data.centered_svd_comparison.max_eigenvalue_difference.toExponential(
              4,
            )}
          </p>

          <div className="mt-4">
            <span
              className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
                data.centered_svd_comparison.comparison_passed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {data.centered_svd_comparison.comparison_passed
                ? "تطابق عددی تأیید شد"
                : "تطابق عددی تأیید نشد"}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

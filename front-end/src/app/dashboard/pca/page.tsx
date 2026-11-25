"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ExplainedVariance {
  component: number;
  explained_variance: number;
  cumulative_variance: number;
}

interface ReducedDimension {
  shape: number[];
  explained_variance: number;
}

interface ScatterPoint {
  customer_index: number;
  pc1: number;
  pc2: number;
}

interface StepFourData {
  customer_count: number;
  product_count: number;
  centered_matrix_shape: number[];
  covariance_shape: number[];
  eigenvalues_count: number;
  required_components_for_90_percent: number;
  explained_variance_data: ExplainedVariance[];
  reduced_dimensions: Record<string, ReducedDimension>;
  scatter_points: ScatterPoint[];
}

export default function PCAPage() {
  const [data, setData] = useState<StepFourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPCA = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/step-four");

        if (!response.ok) {
          throw new Error("دریافت اطلاعات PCA ناموفق بود.");
        }

        const result: StepFourData = await response.json();
        setData(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "خطای نامشخصی رخ داده است.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPCA();
  }, []);

  const varianceData = data?.explained_variance_data?.slice(0, 20) ?? [];

  const maxVariance = Math.max(
    ...varianceData.map((item) => item.explained_variance),
    1,
  );

  const scatter = data?.scatter_points ?? [];

  const minPC1 = Math.min(...scatter.map((p) => p.pc1), 0);
  const maxPC1 = Math.max(...scatter.map((p) => p.pc1), 1);
  const minPC2 = Math.min(...scatter.map((p) => p.pc2), 0);
  const maxPC2 = Math.max(...scatter.map((p) => p.pc2), 1);

  const rangePC1 = maxPC1 - minPC1 || 1;
  const rangePC2 = maxPC2 - minPC2 || 1;

  const scatterPoints = scatter.map((point) => ({
    ...point,
    x: 40 + ((point.pc1 - minPC1) / rangePC1) * 720,
    y: 360 - ((point.pc2 - minPC2) / rangePC2) * 320,
  }));

  return (
    <main className="min-h-screen space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-text-secondary">
            تحلیل داده‌های خرید مشتریان
          </p>

          <h1 className="text-2xl font-bold text-text-primary">
            تحلیل مؤلفه‌های اصلی (PCA)
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            کاهش ابعاد ماتریس خرید و استخراج مؤلفه‌های اصلی
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
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-text-secondary">
          در حال دریافت نتایج تحلیل PCA...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-bg p-5">
          <h2 className="font-semibold text-red-700">خطا در دریافت اطلاعات</h2>

          <p className="mt-2 text-sm text-red-700">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm text-red-700"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm text-text-secondary">تعداد مشتریان</p>
              <p className="mt-3 text-3xl font-bold text-text-primary">
                {data.customer_count.toLocaleString("en-US")}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm text-text-secondary">
                تعداد ویژگی‌های اولیه
              </p>
              <p className="mt-3 text-3xl font-bold text-text-primary">
                {data.product_count}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm text-text-secondary">تعداد مقادیر ویژه</p>
              <p className="mt-3 text-3xl font-bold text-text-primary">
                {data.eigenvalues_count}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm text-text-secondary">
                مؤلفه‌های لازم برای حفظ ۹۰٪ واریانس
              </p>
              <p className="mt-3 text-3xl font-bold text-text-primary">
                {data.required_components_for_90_percent}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-text-primary">
              اطلاعات ماتریس‌ها
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-purple-bg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm text-text-secondary">
                  ابعاد ماتریس مرکز‌شده
                </p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {data.centered_matrix_shape.join(" × ")}
                </p>
              </div>

              <div className="rounded-xl bg-blue-bg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm text-text-secondary">
                  ابعاد ماتریس کوواریانس
                </p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {data.covariance_shape.join(" × ")}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-text-primary">
                واریانس توضیح‌داده‌شده مؤلفه‌ها
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                سهم هر یک از ۲۰ مؤلفه اول در توضیح تغییرات داده‌ها
              </p>
            </div>

            <div className="flex h-64 items-end gap-2 overflow-x-auto border-b border-border pb-2">
              {varianceData.map((item) => (
                <div
                  key={item.component}
                  className="flex h-full min-w-7 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[10px] text-text-secondary">
                    {item.explained_variance.toFixed(1)}%
                  </span>

                  <div
                    className="w-full max-w-10 rounded-t-md bg-primary transition-all"
                    style={{
                      height: `${(item.explained_variance / maxVariance) * 75}%`,
                      minHeight: "2px",
                    }}
                    title={`PC${item.component}: ${item.explained_variance}%`}
                  />

                  <span className="text-[10px] text-text-secondary">
                    {item.component}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-text-secondary">
              محور افقی: شماره مؤلفه اصلی | محور عمودی: درصد واریانس
              توضیح‌داده‌شده
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-text-primary">
              واریانس تجمعی
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              درصد اطلاعات حفظ‌شده با اضافه شدن مؤلفه‌های اصلی
            </p>

            <div className="mt-6 space-y-4">
              {varianceData.map((item) => (
                <div key={item.component}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-text-secondary">
                      مؤلفه {item.component}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {item.cumulative_variance.toFixed(2)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-purple-bg">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(item.cumulative_variance, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-text-secondary">
              این نمودار ۲۰ مؤلفه اول را نمایش می‌دهد. تعداد مؤلفه‌های لازم برای
              رسیدن به ۹۰٪ در کارت بالای صفحه مشخص شده است.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-text-primary">
              مقایسه کاهش ابعاد
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              بررسی میزان اطلاعات حفظ‌شده با تعداد متفاوتی از مؤلفه‌ها
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(data.reduced_dimensions).map(
                ([count, result]) => (
                  <div
                    key={count}
                    className="rounded-xl border border-border p-4"
                  >
                    <p className="text-sm text-text-secondary">
                      {count} مؤلفه اصلی
                    </p>

                    <p className="mt-3 text-2xl font-bold text-text-primary">
                      {result.explained_variance.toFixed(2)}%
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      واریانس حفظ‌شده
                    </p>

                    <div className="mt-4 rounded-lg bg-purple-bg p-3">
                      <p className="text-xs text-text-secondary">
                        ابعاد ماتریس کاهش‌یافته
                      </p>
                      <p className="mt-1 font-semibold text-text-primary">
                        {result.shape.join(" × ")}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-text-primary">
                پراکندگی مشتریان در فضای PCA
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                نمایش مشتریان با استفاده از دو مؤلفه اصلی اول
              </p>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 800 410"
                className="w-full min-w-125"
                role="img"
                aria-label="نمودار پراکندگی مشتریان بر اساس دو مؤلفه اصلی"
              >
                {[80, 160, 240, 320].map((y) => (
                  <line
                    key={y}
                    x1="40"
                    y1={y}
                    x2="760"
                    y2={y}
                    stroke="#E8DDEB"
                    strokeDasharray="4 4"
                  />
                ))}

                <line x1="40" y1="360" x2="760" y2="360" stroke="#897D8D" />

                <line x1="40" y1="40" x2="40" y2="360" stroke="#897D8D" />

                {scatterPoints.map((point) => (
                  <circle
                    key={point.customer_index}
                    cx={point.x}
                    cy={point.y}
                    r="2.5"
                    fill="#A895B9"
                    fillOpacity="0.65"
                  >
                    <title>
                      مشتری {point.customer_index}: PC1={point.pc1.toFixed(3)},
                      PC2={point.pc2.toFixed(3)}
                    </title>
                  </circle>
                ))}

                <text
                  x="400"
                  y="400"
                  textAnchor="middle"
                  fontSize="13"
                  fill="#493F4B"
                >
                  مؤلفه اول (PC1)
                </text>

                <text
                  x="15"
                  y="200"
                  textAnchor="middle"
                  fontSize="13"
                  fill="#493F4B"
                  transform="rotate(-90 15 200)"
                >
                  مؤلفه دوم (PC2)
                </text>
              </svg>
            </div>

            <p className="mt-3 text-xs text-text-secondary">
              هر نقطه نمایانگر یک مشتری است. نزدیکی نقاط نشان‌دهنده شباهت بیشتر
              در فضای دو مؤلفه اصلی است.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

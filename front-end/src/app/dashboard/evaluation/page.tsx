"use client";

import { useEffect, useState } from "react";

interface SVDResult {
  k: number;
  precision_at_5: number;
  total_hits: number;
  total_recommendations: number;
  customers_with_hits: number;
  customer_hit_rate: number;
}

interface BaselineResult {
  precision_at_5: number;
  total_hits: number;
  total_recommendations: number;
  customers_with_hits: number;
  customer_hit_rate: number;
}

interface DepartmentEvaluation {
  customers_with_opportunities: number;
  customers_with_department_hits: number;
  total_opportunities: number;
  matched_opportunities: number;
  opportunity_hit_rate: number;
  customer_hit_rate: number;
}

interface StepEightData {
  customer_count: number;
  product_count: number;
  customers_evaluated: number;
  recommendation_count: number;
  component_counts: number[];
  svd_results: SVDResult[];
  popularity_baseline: BaselineResult;
  department_evaluation: DepartmentEvaluation;
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="mt-3 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-2 text-xs text-text-muted">{description}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-purple-bg">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export default function EvaluationPage() {
  const [data, setData] = useState<StepEightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/step-eight");

        if (!response.ok) {
          throw new Error("دریافت اطلاعات با خطا مواجه شد.");
        }

        const result: StepEightData = await response.json();
        setData(result);
      } catch {
        setError("امکان دریافت اطلاعات ارزیابی وجود ندارد.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center" dir="rtl">
        <p className="text-text-secondary">
          در حال محاسبه و دریافت نتایج ارزیابی...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600"
        dir="rtl"
      >
        {error || "اطلاعاتی برای نمایش وجود ندارد."}
      </div>
    );
  }

  const bestSVDResult = data.svd_results.reduce(
    (best, current) =>
      current.precision_at_5 > best.precision_at_5 ? current : best,
    data.svd_results[0],
  );

  const department = data.department_evaluation;

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          ارزیابی عملکرد سیستم پیشنهاددهنده
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          بررسی میزان موفقیت پیشنهادهای تولیدشده با استفاده از خریدهای واقعی
          مشتریان در سفارش بعدی
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <MetricCard
            title="تعداد مشتریان"
            value={data.customer_count.toString()}
            description="کل مشتریان موجود در داده‌ها"
          />
        </div>

        <div className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <MetricCard
            title="تعداد محصولات"
            value={data.product_count.toString()}
            description="محصولات بررسی‌شده"
          />
        </div>

        <div className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <MetricCard
            title="مشتریان ارزیابی‌شده"
            value={data.customers_evaluated.toString()}
            description="تعداد مشتریان استفاده‌شده در ارزیابی"
          />
        </div>

        <div className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <MetricCard
            title="تعداد پیشنهادها"
            value={data.recommendation_count.toString()}
            description="تعداد پیشنهاد برای هر مشتری"
          />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            ارزیابی پیشنهادهای SVD
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            مقایسه دقت پیشنهادهای پنج‌تایی با تغییر تعداد مؤلفه‌های تجزیه مقدار
            منفرد
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="px-4 py-3">تعداد مؤلفه‌ها (k)</th>
                <th className="px-4 py-3">Precision@5</th>
                <th className="px-4 py-3">تعداد پیشنهادهای موفق</th>
                <th className="px-4 py-3">مشتریان دارای پیشنهاد موفق</th>
                <th className="px-4 py-3">نرخ موفقیت مشتریان</th>
              </tr>
            </thead>

            <tbody>
              {data.svd_results.map((result) => (
                <tr
                  key={result.k}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-4 font-semibold text-text-primary">
                    {result.k}
                  </td>

                  <td className="px-4 py-4 font-bold text-primary">
                    {result.precision_at_5}٪
                  </td>

                  <td className="px-4 py-4 text-text-secondary">
                    {result.total_hits}
                    {" از "}
                    {result.total_recommendations}
                  </td>

                  <td className="px-4 py-4 text-text-secondary">
                    {result.customers_with_hits}
                  </td>

                  <td className="px-4 py-4 text-text-secondary">
                    {result.customer_hit_rate}٪
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl bg-purple-bg/30 p-5">
          <p className="text-sm text-text-secondary">
            بهترین نتیجه در میان مقادیر بررسی‌شده:
          </p>

          <p className="mt-2 font-bold text-text-primary">
            k = {bestSVDResult.k}
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            Precision@5 برابر با {bestSVDResult.precision_at_5}٪
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            مقایسه SVD با روش محبوبیت
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            مقایسه دقت پیشنهادهای SVD با روشی که محصولات محبوب‌تر را به مشتریان
            پیشنهاد می‌دهد
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-text-primary">
                روش SVD (بهترین مقدار k)
              </span>

              <span className="text-sm font-bold text-primary">
                {bestSVDResult.precision_at_5}٪
              </span>
            </div>

            <ProgressBar value={bestSVDResult.precision_at_5} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-text-primary">
                روش محبوبیت
              </span>

              <span className="text-sm font-bold text-text-primary">
                {data.popularity_baseline.precision_at_5.toLocaleString(
                  "fa-IR",
                )}
                ٪
              </span>
            </div>

            <ProgressBar value={data.popularity_baseline.precision_at_5} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            title="پیشنهادهای موفق روش محبوبیت"
            value={data.popularity_baseline.total_hits.toString()}
            description={`از ${data.popularity_baseline.total_recommendations} پیشنهاد`}
          />

          <MetricCard
            title="نرخ موفقیت مشتریان"
            value={`${data.popularity_baseline.customer_hit_rate}٪`}
            description="درصد مشتریانی که حداقل یک پیشنهاد موفق داشته‌اند"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            ارزیابی فرصت‌های پیشنهادی دپارتمان‌ها
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            بررسی خرید واقعی مشتریان از دپارتمان‌هایی که در مرحله هفتم به‌عنوان
            فرصت خرید شناسایی شده بودند
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="مشتریان دارای فرصت خرید"
            value={department.customers_with_opportunities.toLocaleString(
              "fa-IR",
            )}
            description="مشتریانی که حداقل یک دپارتمان پیشنهادی داشته‌اند"
          />

          <MetricCard
            title="فرصت‌های پیشنهادی"
            value={department.total_opportunities.toString()}
            description="مجموع دپارتمان‌های پیشنهادی"
          />

          <MetricCard
            title="فرصت‌های منطبق با خرید واقعی"
            value={department.matched_opportunities.toString()}
            description="دپارتمان‌هایی که در سفارش بعدی خریداری شده‌اند"
          />
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-text-primary">
                نرخ موفقیت فرصت‌های دپارتمانی
              </span>

              <span className="text-sm font-bold text-primary">
                {department.opportunity_hit_rate}٪
              </span>
            </div>

            <ProgressBar value={department.opportunity_hit_rate} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-text-primary">
                نرخ مشتریان دارای خرید موفق
              </span>

              <span className="text-sm font-bold text-primary">
                {department.customer_hit_rate}٪
              </span>
            </div>

            <ProgressBar value={department.customer_hit_rate} />
          </div>
        </div>
      </section>
    </div>
  );
}

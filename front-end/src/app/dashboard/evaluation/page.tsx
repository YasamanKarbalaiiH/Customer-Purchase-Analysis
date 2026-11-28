"use client";

import Link from "next/link";
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

interface DepartmentResult {
  department: string;
  potential_customers: number;
  potential_customers_purchased: number;
  potential_purchase_rate: number;
  other_nonbuyers: number;
  other_nonbuyers_purchased: number;
  other_purchase_rate: number;
  rate_difference: number;
}

interface PCAEvaluation {
  pca_components: number;
  departments: DepartmentResult[];
  top_three_departments: DepartmentResult[];
}

interface DepartmentEvaluation {
  neighbors_count: number;
  threshold_percent: number;
  by_pca_components: PCAEvaluation[];
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
  const [selectedK, setSelectedK] = useState(20);

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
  const selectedPCA = department.by_pca_components.find(
    (item) => item.pca_components === selectedK,
  );

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            ارزیابی عملکرد سیستم پیشنهاددهنده
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            بررسی میزان موفقیت پیشنهادهای تولیدشده با استفاده از خریدهای واقعی
            مشتریان در سفارش بعدی
          </p>
        </div>
        <Link
          href="/dashboard"
          className="w-fit rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-purple-bg"
        >
          بازگشت به داشبورد
        </Link>
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
                {data.popularity_baseline.precision_at_5}٪
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              ارزیابی فرصت‌های پیشنهادی دپارتمان‌ها
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              مقایسه نرخ خرید مشتریان بالقوه با سایر مشتریان فاقد خرید
            </p>
          </div>

          <select
            value={selectedK}
            onChange={(event) => setSelectedK(Number(event.target.value))}
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm text-text-primary"
          >
            {department.by_pca_components.map((item) => (
              <option key={item.pca_components} value={item.pca_components}>
                PCA با {item.pca_components} مؤلفه
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            title="تعداد همسایه‌های مشابه"
            value={department.neighbors_count.toString()}
            description="مشتریان مشابه برای هر مشتری"
          />

          <MetricCard
            title="آستانه شناسایی فرصت"
            value={`${department.threshold_percent}٪`}
            description="حداقل درصد خرید همسایه‌ها"
          />
        </div>

        {selectedPCA && (
          <>
            <h3 className="mb-4 font-semibold text-text-primary">
              سه دپارتمان دارای بیشترین مشتری بالقوه
            </h3>

            <div className="mb-8 overflow-x-auto">
              <table className="w-full min-w-137.5 text-right text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="p-3">رتبه</th>
                    <th className="p-3">دپارتمان</th>
                    <th className="p-3">مشتریان بالقوه</th>
                    <th className="p-3">نرخ خرید بالقوه</th>
                    <th className="p-3">اختلاف نرخ خرید</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedPCA.top_three_departments.map((item, index) => (
                    <tr
                      key={item.department}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium text-text-primary">
                        {item.department}
                      </td>
                      <td className="p-3">{item.potential_customers}</td>
                      <td className="p-3">{item.potential_purchase_rate}٪</td>
                      <td className="p-3">
                        {item.rate_difference > 0 ? "+" : ""}
                        {item.rate_difference} واحد درصد
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mb-4 font-semibold text-text-primary">
              گزارش کامل دپارتمان‌ها
            </h3>

            <div className="space-y-5">
              {selectedPCA.departments.map((item) => (
                <div
                  key={item.department}
                  className="rounded-xl border border-border p-4"
                >
                  <h4 className="mb-5 font-semibold text-text-primary">
                    {item.department}
                  </h4>

                  <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      title="مشتریان بالقوه"
                      value={item.potential_customers.toString()}
                      description="مشتریان شناسایی‌شده توسط PCA"
                    />

                    <MetricCard
                      title="خرید موفق بالقوه‌ها"
                      value={item.potential_customers_purchased.toString()}
                      description="خرید در سفارش بعدی"
                    />

                    <MetricCard
                      title="سایر مشتریان فاقد خرید"
                      value={item.other_nonbuyers.toString()}
                      description="مشتریان خارج از گروه بالقوه"
                    />

                    <MetricCard
                      title="خرید موفق سایر مشتریان"
                      value={item.other_nonbuyers_purchased.toString()}
                      description="خرید در سفارش بعدی"
                    />
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 flex justify-between gap-3">
                        <span className="text-sm text-text-secondary">
                          نرخ خرید مشتریان بالقوه
                        </span>

                        <span className="text-sm font-bold text-primary">
                          {item.potential_purchase_rate}٪
                        </span>
                      </div>

                      <ProgressBar value={item.potential_purchase_rate} />
                    </div>

                    <div>
                      <div className="mb-2 flex justify-between gap-3">
                        <span className="text-sm text-text-secondary">
                          نرخ خرید سایر مشتریان فاقد خرید
                        </span>

                        <span className="text-sm font-bold text-text-primary">
                          {item.other_purchase_rate}٪
                        </span>
                      </div>

                      <ProgressBar value={item.other_purchase_rate} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-purple-bg p-4">
                    <p className="text-sm text-text-secondary">
                      اختلاف نرخ خرید دو گروه
                    </p>

                    <p className="mt-2 text-xl font-bold text-text-primary">
                      {item.rate_difference > 0 ? "+" : ""}
                      {item.rate_difference} واحد درصد
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

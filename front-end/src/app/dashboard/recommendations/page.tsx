"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Recommendation {
  product_id: string;
  score?: number;
  popularity?: number;
}

interface CustomerRecommendation {
  customer_id: number;
  purchased_products_count: number;
  recommendations: Recommendation[];
}

interface StepSixData {
  customer_count: number;
  product_count: number;
  customers_evaluated: number;
  recommendation_count: number;
  selected_k: number;
  component_counts: number[];
  recommendations_by_k: Record<string, CustomerRecommendation[]>;
  popularity_baseline: CustomerRecommendation[];
}

export default function RecommendationsPage() {
  const [data, setData] = useState<StepSixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedK, setSelectedK] = useState("20");
  const [selectedCustomer, setSelectedCustomer] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8000/api/step-six");

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
        در حال بارگذاری پیشنهادهای خرید...
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

  const customerRecommendations = data.recommendations_by_k?.[selectedK] ?? [];

  const currentCustomer = customerRecommendations.find(
    (customer) => customer.customer_id === selectedCustomer,
  );

  const baselineCustomer = data.popularity_baseline?.find(
    (customer) => customer.customer_id === selectedCustomer,
  );

  return (
    <main className="space-y-8 p-6 md:p-8">
      <div>
        <Link
          href="/dashboard/svd"
          className="text-sm text-text-secondary hover:text-primary"
        >
          ← بازگشت به تحلیل SVD
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-text-primary">
          پیشنهاد محصولات به مشتریان
        </h1>

        <p className="mt-2 text-text-secondary">
          تولید پیشنهادهای خرید با استفاده از تجزیه مقدار منفرد (SVD)
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
          <p className="text-sm text-text-secondary">مشتریان بررسی‌شده</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {data.customers_evaluated}
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">
            تعداد پیشنهاد برای هر مشتری
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">
            {data.recommendation_count}
          </h2>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-xl font-bold text-text-primary">
          انتخاب تعداد مؤلفه‌ها
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          با تغییر تعداد مؤلفه‌ها، پیشنهادهای تولیدشده را مقایسه کنید.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {data.component_counts.map((k) => (
            <button
              key={k}
              onClick={() => setSelectedK(String(k))}
              className={`rounded-xl px-6 py-3 text-sm font-medium transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg ${
                selectedK === String(k)
                  ? "bg-primary text-white"
                  : "bg-purple-bg text-text-primary hover:bg-secondary"
              }`}
            >
              {k} مؤلفه
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-xl font-bold text-text-primary">انتخاب مشتری</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {customerRecommendations.map((customer) => (
            <button
              key={customer.customer_id}
              onClick={() => setSelectedCustomer(customer.customer_id)}
              className={`rounded-xl px-4 py-2 text-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg ${
                selectedCustomer === customer.customer_id
                  ? "bg-primary text-white"
                  : "bg-purple-bg text-text-primary hover:bg-secondary"
              }`}
            >
              مشتری {customer.customer_id}
            </button>
          ))}
        </div>
      </section>

      {currentCustomer && (
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-xl font-bold text-text-primary">
            پیشنهادهای خرید مشتری {currentCustomer.customer_id}
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            تعداد محصولات خریداری‌شده قبلی:{" "}
            {currentCustomer.purchased_products_count}
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-112.5 text-right text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="p-3">رتبه پیشنهاد</th>
                  <th className="p-3">شناسه محصول</th>
                  <th className="p-3">امتیاز پیش‌بینی‌شده</th>
                </tr>
              </thead>

              <tbody>
                {currentCustomer.recommendations.map((item, index) => (
                  <tr
                    key={item.product_id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3 font-medium text-text-primary">
                      {index + 1}
                    </td>

                    <td className="p-3 text-text-secondary">
                      {item.product_id}
                    </td>

                    <td className="p-3 text-text-secondary">
                      {item.score?.toFixed(6) ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {baselineCustomer && (
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-xl font-bold text-text-primary">
            مقایسه با روش محبوبیت محصولات
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            محصولاتی که در کل مجموعه داده بیشترین تعداد خرید را داشته‌اند،
            به‌عنوان پیشنهاد انتخاب می‌شوند.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-100 text-right text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="p-3">رتبه</th>
                  <th className="p-3">شناسه محصول</th>
                  <th className="p-3">تعداد خرید توسط مشتریان</th>
                </tr>
              </thead>

              <tbody>
                {baselineCustomer.recommendations.map((item, index) => (
                  <tr
                    key={item.product_id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3 font-medium text-text-primary">
                      {index + 1}
                    </td>

                    <td className="p-3 text-text-secondary">
                      {item.product_id}
                    </td>

                    <td className="p-3 text-text-secondary">
                      {item.popularity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

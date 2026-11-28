"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Neighbor {
  customer_id: number;
  distance: number;
}

interface Opportunity {
  department: string;
  customer_count: number;
  total_neighbors: number;
  percentage: number;
}

interface CustomerOpportunity {
  customer_id: number;
  neighbors: Neighbor[];
  opportunities: Opportunity[];
}
interface DepartmentSummary {
  department: string;
  buyers_count: number;
  nonbuyers_count: number;
  potential_customers: number;
  potential_percentage: number;
}

interface SensitivityResult {
  pca_components: number;
  department_summary: DepartmentSummary[];
  top_three_departments: DepartmentSummary[];
  total_potential_customers: number;
}
interface StepSevenData {
  customer_count: number;
  product_count: number;
  department_count: number;
  departments: string[];
  pca_components: number;
  component_counts: number[];
  neighbors_count: number;
  threshold_percent: number;
  department_matrix_shape: number[];
  opportunities_by_customer: CustomerOpportunity[];
  sensitivity_results: SensitivityResult[];
}

export default function OpportunitiesPage() {
  const [data, setData] = useState<StepSevenData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState(1);
  const [selectedK, setSelectedK] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/step-seven");

        if (!response.ok) {
          throw new Error("دریافت اطلاعات با خطا مواجه شد.");
        }

        const result: StepSevenData = await response.json();

        setData(result);

        if (result.opportunities_by_customer.length > 0) {
          setSelectedCustomer(result.opportunities_by_customer[0].customer_id);
        }
      } catch {
        setError("امکان دریافت اطلاعات مرحله هفتم وجود ندارد.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary">در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error || "اطلاعاتی برای نمایش وجود ندارد."}
      </div>
    );
  }

  const currentCustomer = data.opportunities_by_customer.find(
    (customer) => customer.customer_id === selectedCustomer,
  );

  const neighbors = currentCustomer?.neighbors ?? [];
  const opportunities = currentCustomer?.opportunities ?? [];
  const selectedResult = data.sensitivity_results.find(
    (item) => item.pca_components === selectedK,
  );

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            شناسایی فرصت‌های خرید مشتریان
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            بررسی رفتار مشتریان مشابه با استفاده از PCA و شناسایی دپارتمان‌های
            پیشنهادی
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
        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد کل مشتریان</p>

          <p className="mt-3 text-2xl font-bold text-text-primary">
            {data.customer_count}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد محصولات</p>

          <p className="mt-3 text-2xl font-bold text-text-primary">
            {data.product_count}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد دپارتمان‌ها</p>

          <p className="mt-3 text-2xl font-bold text-text-primary">
            {data.department_count}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
          <p className="text-sm text-text-secondary">تعداد مؤلفه‌های PCA</p>

          <p className="mt-3 text-2xl font-bold text-text-primary">
            {data.pca_components}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              تحلیل حساسیت PCA
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              تأثیر تعداد مؤلفه‌های PCA بر شناسایی مشتریان بالقوه
            </p>
          </div>

          <select
            value={selectedK}
            onChange={(event) => setSelectedK(Number(event.target.value))}
            className="rounded-xl border border-border bg-white px-4 py-2 text-sm text-text-primary"
          >
            {data.component_counts.map((k) => (
              <option key={k} value={k}>
                {k} مؤلفه
              </option>
            ))}
          </select>
        </div>

        {selectedResult && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-purple-bg p-4">
                <p className="text-sm text-text-secondary">
                  تعداد مؤلفه‌های انتخاب‌شده
                </p>

                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {selectedResult.pca_components}
                </p>
              </div>

              <div className="rounded-xl bg-blue-bg p-4">
                <p className="text-sm text-text-secondary">
                  مجموع فرصت‌های مشتری-دپارتمان
                </p>

                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {selectedResult.total_potential_customers}
                </p>
              </div>
            </div>

            <h3 className="mt-8 mb-4 font-semibold text-text-primary">
              سه دپارتمان برتر
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full min-w-137.5 text-sm">
                <thead>
                  <tr className="border-b border-border text-right text-text-secondary">
                    <th className="p-3">رتبه</th>
                    <th className="p-3">دپارتمان</th>
                    <th className="p-3">مشتریان بالقوه</th>
                    <th className="p-3">درصد مشتریان بالقوه</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedResult.top_three_departments.map(
                    (department, index) => (
                      <tr
                        key={department.department}
                        className="border-b border-border last:border-0"
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium text-text-primary">
                          {department.department}
                        </td>
                        <td className="p-3">
                          {department.potential_customers}
                        </td>
                        <td className="p-3">
                          {department.potential_percentage}%
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {selectedResult && (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-lg font-bold text-text-primary">
            گزارش کامل دپارتمان‌ها
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            آمار مشتریان و فرصت‌های فروش هر دپارتمان
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-right text-text-secondary">
                  <th className="p-3">دپارتمان</th>
                  <th className="p-3">خریداران</th>
                  <th className="p-3">فاقدان خرید</th>
                  <th className="p-3">مشتریان بالقوه</th>
                  <th className="p-3">درصد مشتریان بالقوه</th>
                </tr>
              </thead>

              <tbody>
                {selectedResult.department_summary.map((department) => (
                  <tr
                    key={department.department}
                    className="border-b border-border last:border-0"
                  >
                    <td className="p-3 font-medium text-text-primary">
                      {department.department}
                    </td>

                    <td className="p-3">{department.buyers_count}</td>

                    <td className="p-3">{department.nonbuyers_count}</td>

                    <td className="p-3 font-semibold text-text-primary">
                      {department.potential_customers}
                    </td>

                    <td className="p-3">{department.potential_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-6">
        <label className="mb-3 block text-sm font-semibold text-text-primary">
          انتخاب مشتری
        </label>

        <select
          value={selectedCustomer}
          onChange={(event) => setSelectedCustomer(Number(event.target.value))}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
        >
          {data.opportunities_by_customer.map((customer) => (
            <option key={customer.customer_id} value={customer.customer_id}>
              مشتری {customer.customer_id}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-text-primary">مشتریان مشابه</h2>

          <p className="mt-1 text-sm text-text-secondary">
            نزدیک‌ترین مشتریان به مشتری انتخاب‌شده در فضای کاهش‌یافته PCA
          </p>
        </div>

        {neighbors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="px-4 py-3">مشتری</th>
                  <th className="px-4 py-3">فاصله</th>
                </tr>
              </thead>

              <tbody>
                {neighbors.map((neighbor) => (
                  <tr
                    key={neighbor.customer_id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-text-primary">
                      مشتری {neighbor.customer_id}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {neighbor.distance.toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            اطلاعات مشتریان مشابه موجود نیست.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary">
            فرصت‌های پیشنهادی خرید
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            سه دپارتمان برتر که مشتری هنوز از آن‌ها خرید نکرده، اما مشتریان
            مشابه او خریداری کرده‌اند.
          </p>
        </div>

        {opportunities.length > 0 ? (
          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <div
                key={opportunity.department}
                className="rounded-xl border border-border bg-purple-bg/30 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-text-muted">فرصت {index + 1}</p>

                    <h3 className="mt-1 font-bold text-text-primary">
                      {opportunity.department}
                    </h3>
                  </div>

                  <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-primary">
                    {opportunity.percentage}٪
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(opportunity.percentage, 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-text-secondary">
                  {opportunity.customer_count} نفر از{" "}
                  {opportunity.total_neighbors} مشتری مشابه این دپارتمان را
                  خریداری کرده‌اند.
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-purple-bg/30 p-5 text-sm text-text-secondary">
            برای این مشتری فرصت خرید جدیدی شناسایی نشد.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 font-bold text-text-primary">تنظیمات تحلیل</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-text-muted">تعداد مشتریان مشابه</p>
            <p className="mt-1 font-semibold text-text-primary">
              {data.neighbors_count}
            </p>
          </div>

          <div>
            <p className="text-xs text-text-muted">حداقل درصد خرید</p>
            <p className="mt-1 font-semibold text-text-primary">
              {data.threshold_percent}٪
            </p>
          </div>

          <div>
            <p className="text-xs text-text-muted">ابعاد ماتریس دپارتمان</p>
            <p className="mt-1 font-semibold text-text-primary">
              {data.department_matrix_shape.join(" × ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

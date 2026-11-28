"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  product_id: number | string;
  product_name?: string;
  department?: string;
};

type StepOneData = {
  customer_count: number;
  product_count: number;
  X_shape: number[];
  Y_shape: number[];
  X_missing_values: number;
  Y_missing_values: number;
  X_is_binary: boolean;
  Y_is_binary: boolean;
  X_zero_percentage: number;
  Y_zero_percentage: number;
  products_columns: string[];
  products_preview: Product[];
};

type StepTwoData = {
  matrix_shape: number[];
  customer_count: number;
  product_count: number;
  is_expected_shape: boolean;
  zero_percentage: number;
  one_percentage: number;
  top_five_products: {
    product_column: string;
    customer_count: number;
  }[];
  average_products_per_customer: number;
  minimum_products_per_customer: number;
  maximum_products_per_customer: number;
};

export default function Home() {
  const [data, setData] = useState<StepOneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stepTwo, setStepTwo] = useState<StepTwoData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8000/api/step-one");

        if (!response.ok) {
          throw new Error("دریافت اطلاعات از سرور با خطا مواجه شد.");
        }

        const result = await response.json();
        setData(result);

        const stepTwoResponse = await fetch(
          "http://localhost:8000/api/step-two",
        );

        if (!stepTwoResponse.ok) {
          throw new Error("دریافت اطلاعات بخش دوم با خطا مواجه شد.");
        }

        const stepTwoResult: StepTwoData = await stepTwoResponse.json();

        setStepTwo(stepTwoResult);
      } catch {
        setError("اتصال به بک‌اند برقرار نشد. سرور Python را بررسی کن.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statistics = [
    {
      title: "تعداد مشتریان",
      value: data?.customer_count ?? "—",
      description: "مشتریان موجود در مجموعه داده",
      color: "bg-purple-bg",
      icon: "users",
    },
    {
      title: "تعداد محصولات",
      value: data?.product_count ?? "—",
      description: "محصولات انتخاب‌شده",
      color: "bg-blue-bg",
      icon: "package",
    },
    {
      title: "ابعاد ماتریس X",
      value: data ? data.X_shape.join(" × ") : "—",
      description: "خریدهای قبلی مشتریان",
      color: "bg-green-bg",
      icon: "chart",
    },
    {
      title: "ابعاد ماتریس Y",
      value: data ? data.Y_shape.join(" × ") : "—",
      description: "خریدهای سفارش بعدی",
      color: "bg-yellow-bg",
      icon: "layers",
    },
  ];

  const validations = data
    ? [
        {
          title: "مقادیر خالی در X",
          valid: data.X_missing_values === 0,
          value: data.X_missing_values,
        },
        {
          title: "مقادیر خالی در Y",
          valid: data.Y_missing_values === 0,
          value: data.Y_missing_values,
        },
        {
          title: "مقادیر دودویی در X",
          valid: data.X_is_binary,
          value: data.X_is_binary ? "فقط ۰ و ۱" : "مقادیر نامعتبر",
        },
        {
          title: "مقادیر دودویی در Y",
          valid: data.Y_is_binary,
          value: data.Y_is_binary ? "فقط ۰ و ۱" : "مقادیر نامعتبر",
        },
      ]
    : [];

  return (
    <div dir="rtl" className="min-h-screen bg-background text-text-primary">
      <main className="min-w-0 p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-text-secondary">
              پروژه تحلیل داده‌های خرید
            </p>

            <h2 className="text-2xl font-bold">داشبورد اصلی</h2>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-green" />

            <span className="text-sm text-text-secondary">
              {loading
                ? "در حال اتصال..."
                : error
                  ? "عدم اتصال"
                  : "وضعیت سیستم: متصل"}
            </span>
            <Link
              href="/"
              className="w-fit rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-purple-bg"
            >
              بازگشت به خانه
            </Link>
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-5">
            <h3 className="text-lg font-bold">خلاصه داده‌ها</h3>

            <p className="mt-1 text-sm text-text-secondary">
              نمای کلی از اطلاعات بارگذاری‌شده در پروژه
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {item.title}
                  </span>

                  <span className={`rounded-xl p-3 ${item.color}`}>
                    {item.icon === "users" ? "♙" : null}
                    {item.icon === "package" ? "▣" : null}
                    {item.icon === "chart" ? "▥" : null}
                    {item.icon === "layers" ? "▤" : null}
                  </span>
                </div>

                <p className="text-2xl font-bold" dir="ltr">
                  {loading ? "..." : item.value}
                </p>

                <p className="mt-2 text-xs text-text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red/30 bg-red-bg p-4 text-sm text-red">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-border bg-white p-5">
          <div className="mb-5">
            <h3 className="font-bold">اعتبارسنجی داده‌ها</h3>

            <p className="mt-1 text-sm text-text-secondary">
              بررسی اولیه کیفیت ماتریس‌های خرید
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-text-secondary">
              در حال بررسی داده‌ها...
            </p>
          ) : error ? (
            <p className="text-sm text-text-secondary">
              پس از اتصال به بک‌اند، نتایج این بخش نمایش داده می‌شوند.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {validations.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl bg-background p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 ">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        item.valid
                          ? "bg-green-bg text-green"
                          : "bg-red-bg text-red"
                      }`}
                    >
                      {item.valid ? "✓" : "!"}
                    </span>

                    <span className="text-sm">{item.title}</span>
                  </div>

                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
            <h3 className="font-bold">تراکم ماتریس X</h3>

            <p className="mt-1 text-sm text-text-secondary">
              درصد خانه‌های خالی از خرید قبلی
            </p>

            <p className="mt-5 text-3xl font-bold text-primary">
              {data ? `${data.X_zero_percentage}%` : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
            <h3 className="font-bold">تراکم ماتریس Y</h3>

            <p className="mt-1 text-sm text-text-secondary">
              درصد خانه‌های خالی از سفارش بعدی
            </p>

            <p className="mt-5 text-3xl font-bold text-blue">
              {data ? `${data.Y_zero_percentage}%` : "—"}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-border bg-white p-5">
          <div className="mb-5">
            <h3 className="font-bold">تحلیل ماتریس مشتری–کالا (X)</h3>

            <p className="mt-1 text-sm text-text-secondary">
              نتایج محاسبات بخش دوم پروژه
            </p>
          </div>

          {!stepTwo ? (
            <p className="text-sm text-text-secondary">
              در حال دریافت اطلاعات...
            </p>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 ">
                <div className="rounded-xl bg-purple-bg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm text-text-secondary">ابعاد ماتریس X</p>
                  <p className="mt-2 text-2xl font-bold" dir="ltr">
                    {stepTwo.matrix_shape.join(" × ")}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-bg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm text-text-secondary">
                    درصد خانه‌های صفر
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {stepTwo.zero_percentage}%
                  </p>
                </div>

                <div className="rounded-xl bg-green-bg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm text-text-secondary">
                    درصد خانه‌های یک
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {stepTwo.one_percentage}%
                  </p>
                </div>

                <div className="rounded-xl bg-yellow-bg p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm text-text-secondary">
                    میانگین محصولات هر مشتری
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {stepTwo.average_products_per_customer}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-xl bg-background p-4 ">
                <p className="text-sm text-text-secondary">
                  وضعیت ابعاد ماتریس
                </p>

                <p className="mt-2 font-semibold">
                  {stepTwo.is_expected_shape
                    ? "ابعاد ماتریس مطابق مقدار مورد انتظار است."
                    : "ابعاد ماتریس با مقدار مورد انتظار مطابقت ندارد."}
                </p>
              </div>

              <h4 className="mb-3 font-semibold">
                پنج محصول با بیشترین تعداد خریدار
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="px-4 py-3">ستون محصول</th>
                      <th className="px-4 py-3">تعداد خریداران</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stepTwo.top_five_products.map((product) => (
                      <tr
                        key={product.product_column}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3" dir="ltr">
                          {product.product_column}
                        </td>

                        <td className="px-4 py-3">{product.customer_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-wrap gap-6 text-sm text-text-secondary">
                <p>
                  حداقل محصولات یک مشتری:{" "}
                  {stepTwo.minimum_products_per_customer}
                </p>

                <p>
                  حداکثر محصولات یک مشتری:{" "}
                  {stepTwo.maximum_products_per_customer}
                </p>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-5">
            <h3 className="font-bold">پیش‌نمایش محصولات</h3>

            <p className="mt-1 text-sm text-text-secondary">
              ۱۰ محصول اول مجموعه داده
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-125 text-right text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="px-4 py-3 font-medium">شناسه محصول</th>

                  <th className="px-4 py-3 font-medium">نام محصول</th>

                  <th className="px-4 py-3 font-medium">دسته‌بندی</th>
                </tr>
              </thead>

              <tbody>
                {data?.products_preview.map((product) => (
                  <tr
                    key={product.product_id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-4" dir="ltr">
                      {product.product_id}
                    </td>

                    <td className="px-4 py-4">{product.product_name || "—"}</td>

                    <td className="px-4 py-4">{product.department || "—"}</td>
                  </tr>
                ))}

                {!loading && data?.products_preview.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-text-muted"
                    >
                      محصولی برای نمایش وجود ندارد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}


import { Suspense } from "react";
import ProductDetails from "./ProductDetails";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductPage({
  params,
}: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-xs font-bold tracking-[0.2em]">
            LOADING PRODUCT...
          </p>
        </main>
      }
    >
      {params.then(({ id }) => (
        <ProductDetails id={id} />
      ))}
    </Suspense>
  );
}

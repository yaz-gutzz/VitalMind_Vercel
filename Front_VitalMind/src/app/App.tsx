import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 text-sm">
          Cargando VitalMind...
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
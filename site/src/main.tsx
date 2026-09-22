import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles.css";

function AppError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Unknown application error";
  return <main className="error-page"><p className="eyebrow dark">Samarpan</p><h1>We’re taking a small pause.</h1><p>Something unexpected happened. Please refresh the page or try again in a moment.</p><button className="button" onClick={() => window.location.reload()}>Refresh the page</button><pre aria-hidden="true">{message}</pre></main>;
}

createRoot(document.getElementById("app")!).render(
  <React.StrictMode><RouterProvider router={router} defaultPendingComponent={() => <div className="route-loading" role="status">Loading Samarpan…</div>} defaultErrorComponent={({ error }) => <AppError error={error} />} /></React.StrictMode>,
);

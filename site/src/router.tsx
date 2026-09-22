import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
// This app uses Vite + React rather than Next.js, so use the framework-matched
// entry point. The /next entry requires next/navigation at bundle time.
import { Analytics } from "@vercel/analytics/react";
import { Storefront } from "./storefront";

function AppLayout() {
  return <><Outlet /><Analytics /></>;
}

const rootRoute = createRootRoute({ component: AppLayout });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Storefront });
const collectionRoute = createRoute({ getParentRoute: () => rootRoute, path: "/collection", component: Storefront });
const storyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/story", component: Storefront });
const routeTree = rootRoute.addChildren([homeRoute, collectionRoute, storyRoute]);

export const router = createRouter({ routeTree });

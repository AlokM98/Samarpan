import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { Storefront } from "./storefront";

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Storefront });
const collectionRoute = createRoute({ getParentRoute: () => rootRoute, path: "/collection", component: Storefront });
const storyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/story", component: Storefront });
const routeTree = rootRoute.addChildren([homeRoute, collectionRoute, storyRoute]);

export const router = createRouter({ routeTree });

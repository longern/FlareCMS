import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import App from "./App";
import PostDetail from "./PostDetail";
import adminRouter from "./admin/index";
import "./i18n";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const AppGlobalStyles = (
  <GlobalStyles
    styles={{
      "html, body, #root, .App": {
        height: "100%",
      },
    }}
  />
);

async function rootLoader({ request }) {
  try {
    const res = await fetch("/api/options");
    const options: Record<string, string> = await res.json();

    if (
      options["error"] === "Secret not set" &&
      new URL(request.url).pathname !== "/install"
    )
      return redirect("/install");

    if (options["blogName"]) document.title = options["blogName"];
    if (options["blogDescription"])
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", options["blogDescription"]);
    return options;
  } catch (err) {
    return { error: err.message };
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    id: "root",
    loader: rootLoader,
    children: [
      {
        path: "",
        element: <App key="index" />,
      },
      {
        path: "posts/label/:label",
        element: <App key="label" />,
      },
      {
        path: "posts/:id",
        element: <PostDetail />,
      },
      {
        path: "pages/:id",
        element: <PostDetail />,
      },
      {
        path: "install",
        lazy: async () => {
          const Component = (await import("./Install")).default;
          return { Component };
        },
      },
      {
        path: "login",
        lazy: async () => {
          const Component = (await import("./Login")).default;
          return { Component };
        },
      },
      {
        path: "admin",
        children: adminRouter,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {AppGlobalStyles}
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

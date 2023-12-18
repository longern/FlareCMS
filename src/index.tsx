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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    id: "root",
    loader: ({ request }) =>
      fetch("/api/options")
        .then(async (res) => {
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
        })
        .catch((res) => {
          return { error: res };
        }),
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/posts/label/:label",
        element: <App />,
      },
      {
        path: "/posts/:id",
        element: <PostDetail />,
      },
      {
        path: "/posts/edit/:id",
        lazy: async () => {
          const Component = (await import("./Editor")).default;
          return { Component };
        },
      },
      {
        path: "/install",
        lazy: async () => {
          const Component = (await import("./Install")).default;
          return { Component };
        },
      },
      {
        path: "/login",
        lazy: async () => {
          const Component = (await import("./Login")).default;
          return { Component };
        },
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

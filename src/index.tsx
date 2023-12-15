import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import App from "./App";
import PostDetail from "./PostDetail";

fetch("/api/options")
  .then(async (res) => {
    const options: Record<string, string> = await res.json();
    if (options["blogName"]) document.title = options["blogName"];
    if (options["blogDescription"])
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", options["blogDescription"]);
  })
  .catch(() => {});

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

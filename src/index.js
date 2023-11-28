import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import App from "./App";
import Editor from "./Editor";
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
    element: <App />,
  },
  {
    path: "/posts/:id",
    element: <PostDetail />,
  },
  {
    path: "/posts/edit/:id",
    element: <Editor />,
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

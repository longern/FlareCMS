import React from "react";
import { RouteObject, redirect } from "react-router-dom";

import Layout from "./Layout";
import Posts from "./Posts";
import Settings from "./Settings";

const router: RouteObject[] = [
  {
    path: "",
    element: <Layout />,
    id: "adminRoot",
    children: [
      {
        path: "",
        loader: () => redirect("/admin/posts"),
      },
      {
        path: "posts",
        element: <Posts type="post" />,
      },
      {
        path: "pages",
        element: <Posts type="page" />,
      },
      {
        path: "posts/:id",
        lazy: async () => {
          const { Editor } = await import("./Editor");
          return { element: <Editor type="post" /> };
        },
      },
      {
        path: "pages/:id",
        lazy: async () => {
          const { Editor } = await import("./Editor");
          return { element: <Editor type="page" /> };
        },
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
];

export default router;

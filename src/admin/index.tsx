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
        element: <Posts />,
      },
      {
        path: "posts/:id",
        lazy: async () => {
          const Component = (await import("./Editor")).default;
          return { Component };
        },
      },
      {
        path: "settings",
        element: <Settings />,
      }
    ],
  },
];

export default router;

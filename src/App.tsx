import React, { useEffect, useState } from "react";
import {
  AppBar,
  Breadcrumbs,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Toolbar,
  Typography,
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useParams } from "react-router-dom";

import { Post, PostCard } from "./PostDetail";
import { useBlogOptions } from "./hooks";
import Sidebar from "./Sidebar";

function BlogAppBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const blogOptions = useBlogOptions();

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {blogOptions.blogName || "Blog"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const params = useParams<{ label: string }>();
  const theme = useTheme();
  const matchesLg = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    const searchParams = new URLSearchParams({
      type: "post",
      status: "publish",
      orderBy: "published",
      q: params.label ? `label:${params.label}` : undefined,
    });
    const request = params.label
      ? fetch(`/api/posts/search?${searchParams}`)
      : fetch(`/api/posts?${searchParams}`);
    request
      .then((response) => response.json() as Promise<{ items: Post[] }>)
      .then((body) => setPosts(body.items))
      .catch((err) => setError(err.message));
  }, [params.label]);

  return (
    <div className="App">
      {matchesLg ? (
        <Drawer variant="permanent" anchor="left">
          <Box sx={{ width: 320 }}>
            <Sidebar />
          </Box>
        </Drawer>
      ) : (
        <>
          <BlogAppBar
            onMenuClick={matchesLg ? null : () => setSidebarOpen(!sidebarOpen)}
          />
          <Drawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            anchor="left"
            keepMounted
          >
            <Box sx={{ width: 320 }}>
              <Toolbar />
              <Sidebar />
            </Box>
          </Drawer>
          <Toolbar />
        </>
      )}
      <Container maxWidth="md" sx={{ py: "1rem" }}>
        {params.label && (
          <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "1rem" }}>
            <Link component={RouterLink} to="/">
              Home
            </Link>
            <Typography color="text.primary">{params.label}</Typography>
          </Breadcrumbs>
        )}
        {error ? (
          <code>{error}</code>
        ) : !posts ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            No posts found
          </Typography>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.rowid}
              post={post}
              to={`/posts/${post.rowid}`}
            />
          ))
        )}
      </Container>
    </div>
  );
}

export default App;

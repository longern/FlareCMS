import React, { useEffect, useState } from "react";
import {
  AppBar,
  Breadcrumbs,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Link,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Link as RouterLink,
  useParams,
} from "react-router-dom";

import { Post, PostCard } from "./PostDetail";
import { useBlogOptions } from "./hooks";

function BlogAppBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const blogOptions = useBlogOptions();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {blogOptions.blogName || "Blog"}
        </Typography>
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem component={RouterLink} to="/">
            Home
          </MenuItem>
          <MenuItem component={RouterLink} to="/posts/label/about">
            About
          </MenuItem>
          <MenuItem component={RouterLink} to="/admin">
            Admin Panel
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ label: string }>();

  useEffect(() => {
    const searchParams = new URLSearchParams({
      type: "post",
      status: "publish",
      orderBy: "published",
    });
    const request = params.label
      ? fetch(`/api/posts/search?q=label:${params.label}`)
      : fetch(`/api/posts?${searchParams}`);
    request
      .then((response) => response.json() as Promise<{ items: Post[] }>)
      .then((body) => setPosts(body.items))
      .catch((err) => setError(err.message));
  }, [params.label]);

  return (
    <div className="App">
      <BlogAppBar />
      <Container maxWidth="md" sx={{ marginTop: "1rem" }}>
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
            <PostCard key={post.rowid} post={post} to={`/posts/${post.rowid}`} />
          ))
        )}
      </Container>
    </div>
  );
}

export default App;

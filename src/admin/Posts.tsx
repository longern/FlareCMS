import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useCallback, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import { Post } from "../PostDetail";

function Posts() {
  const [posts, setPosts] = React.useState<Post[] | null>(null);
  const [error, setError] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activePost, setActivePost] = React.useState<Post | null>(null);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const request = fetch("/api/posts");
    request
      .then((response) => response.json() as Promise<{ items: Post[] }>)
      .then((body) => setPosts(body.items))
      .catch((err) => setError(err.message));
  }, []);

  const handleDelete = useCallback(
    (post) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (!confirmed) return;
      fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then(() => navigate("/"));
    },
    [navigate]
  );

  return (
    <Container sx={{ py: 2 }}>
      <Typography variant="h4">Posts</Typography>
      {error ? (
        <code>{error}</code>
      ) : posts === null ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ my: 2 }}>
            <CardContent>
              <Link
                component={RouterLink}
                to={`/admin/posts/${post.id}`}
                underline="none"
                sx={{ "-webkit-tap-highlight-color": "transparent" }}
              >
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.title}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ float: "right" }}
                    aria-label="manage post"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePost(post);
                      setAnchorEl(e.currentTarget);
                    }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </Stack>
                <Typography variant="subtitle1" color="text.secondary">
                  {DateTime.fromMillis(post.published).toRelative()}
                </Typography>
              </Link>
            </CardContent>
          </Card>
        ))
      )}
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          setActivePost(null);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <MenuItem component={RouterLink} to={`/admin/posts/${activePost?.id}`}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDelete(activePost)}
          sx={{ color: theme.palette.error.main }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default Posts;

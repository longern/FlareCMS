import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Fab,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Public as PublicIcon,
  PublicOff as PublicOffIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import React, { useCallback, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import { Post } from "../PostDetail";
import { useTranslation } from "react-i18next";

function Posts({ type }: { type: "page" | "post" }) {
  const [activeTab, setActiveTab] = React.useState(0);
  const [posts, setPosts] = React.useState<Post[] | null>(null);
  const [error, setError] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activePost, setActivePost] = React.useState<Post | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchPosts = useCallback(
    (params: { type?: "page" | "post"; status?: "publish" | "draft" }) => {
      setError("");
      setPosts(null);
      const searchParams = new URLSearchParams(params);
      const request = fetch(`/api/posts?${searchParams}`);
      request
        .then((response) => response.json() as Promise<{ items: Post[] }>)
        .then((body) => setPosts(body.items))
        .catch((err) => setError(err.message));
    },
    []
  );

  useEffect(() => {
    const status = activeTab === 0 ? "publish" : "draft";
    fetchPosts({ type, status });
  }, [activeTab, fetchPosts, type]);

  const handlePublish = useCallback((post: Post) => {
    setAnchorEl(null);
    fetch(`/api/posts/${post.rowid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        status: "publish",
      }),
    }).then(() => setActiveTab(0));
  }, []);

  const handleDepublish = useCallback((post: Post) => {
    setAnchorEl(null);
    fetch(`/api/posts/${post.rowid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        status: "draft",
      }),
    }).then(() => setActiveTab(1));
  }, []);

  const handleDelete = useCallback(
    (post: Post) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (!confirmed) return;
      fetch(`/api/posts/${post.rowid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then(() => navigate("/"));
    },
    [navigate]
  );

  return (
    <Stack>
      <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)}>
        <Tab label={t("Published")} />
        <Tab label={t("Drafts")} />
      </Tabs>
      <Container sx={{ py: 2 }}>
        {error ? (
          <Stack alignItems="center" spacing={2}>
            <code>{error}</code>
            <Button variant="contained" onClick={() => fetchPosts({ type })}>
              {t("Retry")}
            </Button>
          </Stack>
        ) : posts === null ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {type === "post" ? t("No posts found") : t("No pages found")}
            </Typography>
          </Box>
        ) : (
          posts.map((post) => (
            <Card key={post.rowid} sx={{ my: 2 }}>
              <CardContent>
                <Link
                  component={RouterLink}
                  to={`/admin/${type}s/${post.rowid}`}
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
                      {post.title || t("(Untitled)")}
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
                      <MoreVertIcon />
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
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            component={RouterLink}
            to={`/${type}s/${activePost?.rowid}`}
          >
            <ListItemIcon>
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText primary={t("View")}></ListItemText>
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to={`/admin/${type}s/${activePost?.rowid}`}
          >
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={t("Edit")}></ListItemText>
          </MenuItem>
          {activePost?.status === "publish" ? (
            <MenuItem onClick={() => handleDepublish(activePost)}>
              <ListItemIcon>
                <PublicOffIcon />
              </ListItemIcon>
              <ListItemText primary={t("Depublish")}></ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handlePublish(activePost)}>
              <ListItemIcon>
                <PublicIcon />
              </ListItemIcon>
              <ListItemText primary={t("Publish")}></ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => handleDelete(activePost)}>
            <ListItemIcon>
              <DeleteIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary={t("Delete")}
              primaryTypographyProps={{ color: "error" }}
            ></ListItemText>
          </MenuItem>
        </Menu>
      </Container>
      <Fab
        color="primary"
        component={RouterLink}
        to={`/admin/${type}s/new`}
        sx={(theme) => ({
          position: "fixed",
          bottom: theme.spacing(4),
          right: theme.spacing(4),
        })}
      >
        <AddIcon />
      </Fab>
    </Stack>
  );
}

export default Posts;

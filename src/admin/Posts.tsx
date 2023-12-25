import {
  Box,
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

  useEffect(() => {
    const searchParams = new URLSearchParams({
      type,
      status: activeTab === 0 ? "publish" : "draft",
    });
    const request = fetch(`/api/posts?${searchParams}`);
    request
      .then((response) => response.json() as Promise<{ items: Post[] }>)
      .then((body) => setPosts(body.items))
      .catch((err) => setError(err.message));
  }, [activeTab, type]);

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
          <code>{error}</code>
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
                  to={`/admin/posts/${post.rowid}`}
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
          onClose={() => {
            setAnchorEl(null);
            setActivePost(null);
          }}
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
            to={`/admin/posts/${activePost?.rowid}`}
          >
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={t("Edit")}></ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => handleDelete(activePost)}
            sx={(theme) => ({ color: theme.palette.error.main })}
          >
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary={t("Delete")}></ListItemText>
          </MenuItem>
        </Menu>
      </Container>
      <Fab
        color="primary"
        component={RouterLink}
        to="/admin/posts/new"
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

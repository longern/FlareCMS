import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useTheme } from "@mui/material/styles";
import { DateTime } from "luxon";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

export interface Post {
  id: string;
  title: string;
  content: string;
  published: number;
  updated: number;
  labels?: string[];
}

export function PostCard({ post, to }: { post: Post; to?: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;
    fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
    }).then(() => navigate("/"));
  }

  return (
    <Card sx={{ marginBottom: "1rem" }}>
      <IconButton
        size="small"
        sx={{ float: "right" }}
        aria-label="manage post"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreHorizIcon />
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
        <MenuItem component={RouterLink} to={`/posts/edit/${post.id}`}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ color: theme.palette.error.main }}
        >
          Delete
        </MenuItem>
      </Menu>
      <CardContent>
        <Typography variant="h5" component="h2" mb={1}>
          {to ? (
            <Link component={RouterLink} to={to}>
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {DateTime.fromMillis(post.published).toRelative()}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          dangerouslySetInnerHTML={{ __html: post.content }}
          sx={{
            "& img": {
              maxWidth: "100%",
            },
          }}
        />
        {post.labels && post.labels.length > 0 && (
          <Typography variant="subtitle2" color="text.secondary">
            {post.labels.map((label) => (
              <Link
                key={label}
                component={RouterLink}
                to={`/posts/label/${label}`}
                sx={{ marginRight: "0.5rem" }}
              >
                {`#${label}`}
              </Link>
            ))}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((response) => response.json() as Promise<Post | { error: string }>)
      .then((body) => ("error" in body ? setError(body.error) : setPost(body)))
      .catch((err) => setError(err.message));
  }, [id, location]);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="back"
            component={RouterLink}
            to="/"
          >
            <ArrowBack />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ marginTop: "1rem" }}>
        {error ? (
          <code>{error}</code>
        ) : !post ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <PostCard post={post} />
        )}
      </Container>
    </div>
  );
}

export default PostDetail;

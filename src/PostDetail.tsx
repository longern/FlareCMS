import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
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
  published: string;
  updated: string;
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
          {new Date(post.published).toLocaleString()}
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
        {error || (post && <PostCard post={post} />)}
      </Container>
    </div>
  );
}

export default PostDetail;

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
import { Link as RouterLink, useParams } from "react-router-dom";

export interface Post {
  id: string;
  title: string;
  content: string;
  published: string;
  updated: string;
}

export function PostCard({ post, to }: { post: Post; to?: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;
    fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
    }).then(() => window.location.reload());
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
        <MenuItem color="error" onClick={handleDelete}>
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
      </CardContent>
    </Card>
  );
}

function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((response) => response.json() as Promise<Post>)
      .then((body) => setPost(body))
      .catch((err) => console.error(err));
  }, [id]);

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
        {post && <PostCard post={post} />}
      </Container>
    </div>
  );
}

export default PostDetail;

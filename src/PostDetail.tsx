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
} from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { DateTime } from "luxon";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { useBlogOptions } from "./hooks";

export interface Post {
  rowid: number;
  title: string;
  content: string;
  type: "post" | "page";
  status: "publish" | "draft";
  published: number;
  updated: number;
  labels?: string[];
  replies?: {
    rowid: number;
    content: string;
    published: number;
  }[];
}

export function PostCard({ post, to }: { post: Post; to?: string }) {
  return (
    <Card sx={{ marginBottom: "1rem" }}>
      <CardContent>
        <Typography variant="h5" component="h2" mb={1}>
          {to ? (
            <Link component={RouterLink} to={to} underline="hover">
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </Typography>
        <Typography
          variant="subtitle2"
          component="span"
          color="text.secondary"
          title={new Date(post.published).toLocaleString()}
        >
          {DateTime.fromMillis(post.published).toRelative()}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          dangerouslySetInnerHTML={{ __html: post.content }}
          sx={{
            my: "2rem",
            "& img": {
              maxWidth: "100%",
            },
          }}
        />
        {post.labels && post.labels.length > 0 && (
          <Typography variant="body2" component="div" color="text.secondary">
            {post.labels.map((label) => (
              <Link
                key={label}
                component={RouterLink}
                to={`/posts/label/${label}`}
                underline="hover"
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

  const blogOptions = useBlogOptions();

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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {blogOptions.blogName}
          </Typography>
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

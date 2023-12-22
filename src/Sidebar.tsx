import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import type { Post } from "./PostDetail";

interface Label {
  name: string;
  count: number;
}

function PageList() {
  const [pages, setPages] = useState<Post[] | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/posts?type=page");
      const json: { items: Post[] } = await res.json();
      setPages(json.items);
    })();
  }, []);

  return (
    <List disablePadding>
      {pages === null ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <CircularProgress />
        </Box>
      ) : pages.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          No pages found
        </Box>
      ) : (
        pages.map((page) => (
          <ListItemButton
            key={page.rowid}
            component={RouterLink}
            to={`/pages/${page.rowid}`}
          >
            <ListItemText primary={page.title} />
          </ListItemButton>
        ))
      )}
    </List>
  );
}

function Sidebar() {
  const [labels, setLabels] = useState<Label[] | null>(null);
  const [showPages, setShowPages] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/labels");
      const json: { items: Label[] } = await res.json();
      setLabels(json.items);
    })();
  }, []);

  return (
    <Stack>
      <List>
        <ListItemButton component={RouterLink} to="/">
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton onClick={() => setShowPages(!showPages)}>
          <ListItemText primary="Pages" />
          {showPages ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={showPages} timeout="auto" unmountOnExit>
          <PageList />
        </Collapse>
        <ListItemButton component={RouterLink} to="/admin">
          <ListItemText primary="Admin" />
        </ListItemButton>
      </List>
      <Divider />
      <Stack spacing={1} p={1}>
        {labels === null ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        ) : labels.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            No labels found
          </Box>
        ) : (
          <Box>
            {labels.map((label) => (
              <Link
                key={label.name}
                component={RouterLink}
                to={`/posts/label/${label.name}`}
                underline="hover"
                sx={{ marginRight: "0.5rem" }}
              >
                <Chip label={`${label.name} (${label.count})`} />
              </Link>
            ))}
          </Box>
        )}
      </Stack>
    </Stack>
  );
}

export default Sidebar;

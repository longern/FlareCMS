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
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import type { Post } from "./PostDetail";
import { useTranslation } from "react-i18next";

interface Label {
  name: string;
  count: number;
}

function PageList() {
  const [pages, setPages] = useState<Post[] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/posts?type=page&status=publish");
      const json: { items: Post[] } = await res.json();
      setPages(json.items);
    })();
  }, []);

  return (
    <List disablePadding sx={{ pl: 4 }}>
      {pages === null ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <CircularProgress />
        </Box>
      ) : pages.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <Typography variant="body2" component="div" color="text.secondary">
            {t("No pages found")}
          </Typography>
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
  const { t } = useTranslation();

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
          <ListItemText primary={t("Home")} />
        </ListItemButton>
        <ListItemButton onClick={() => setShowPages(!showPages)}>
          <ListItemText primary={t("Pages")} />
          {showPages ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={showPages}>
          <PageList />
        </Collapse>
        <ListItemButton component={RouterLink} to="/admin">
          <ListItemText primary={t("Admin Panel")} />
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
            <Typography variant="body2" component="div" color="text.secondary">
              {t("No labels found")}
            </Typography>
          </Box>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {labels.map((label) => (
              <Link
                key={label.name}
                component={RouterLink}
                to={`/posts/label/${label.name}`}
              >
                <Chip label={`${label.name} (${label.count})`} />
              </Link>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default Sidebar;

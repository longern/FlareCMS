import React, { useCallback, useEffect, useState } from "react";
import { ArrowBack, Send, MoreVert as MoreVertIcon } from "@mui/icons-material";
import {
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Post } from "../PostDetail";

export function Editor({ type }: { type: "post" | "page" }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { id } = useParams<{ id: string }>();
  const quill = React.useRef<ReactQuill | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSend = useCallback(
    async (post: {
      id?: number;
      title: string;
      content: string;
      type?: "post" | "page";
      status?: "publish" | "draft";
      labels?: string[];
    }) => {
      if (!post.content) return;
      const id = post.id;
      delete post.id;

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setUploading(true);
        const method = id ? "PATCH" : "POST";
        const res = await fetch(`/api/posts/${id || ""}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(post),
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        const result: { rowid: number } = await res.json();
        navigate(`/posts/${result.rowid}`);
      } catch (err) {
        if (err instanceof Error) console.error(err.message);
      } finally {
        setUploading(false);
      }
    },
    [navigate]
  );

  function handleUploadMedia() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = function () {
      const file = input.files?.[0];
      if (!file) return;

      const fileType = file.type.split("/")[0];
      fetch("/api/assets", {
        method: "POST",
        body: file,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json() as Promise<{ id: string }>)
        .then((res) => {
          if (!quill.current) return;
          quill.current.focus();
          const range = quill.current.getEditor().getSelection();
          quill.current
            .getEditor()
            .insertEmbed(range!.index, fileType, "/api/assets/" + res.id);
        });
    };
    input.click();
  }

  useEffect(() => {
    quill.current?.focus();

    const toolbar = quill.current?.getEditor().getModule("toolbar");
    if (toolbar) toolbar.addHandler("image", handleUploadMedia);

    if (id === "new") return;
    fetch(`/api/posts/${id}`)
      .then((res) => res.json() as Promise<Post>)
      .then((res) => {
        setTitle(res.title);
        setContent(res.content);
        setLabels(res.labels);
      });
  }, [id]);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar variant="dense" disableGutters>
        <IconButton
          size="large"
          color="inherit"
          component={RouterLink}
          to={`/admin/${type}s`}
        >
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1} textAlign="center">
          {type === "post"
            ? id === "new"
              ? t("New post")
              : t("Edit post")
            : id === "new"
            ? t("New page")
            : t("Edit page")}
        </Box>
        <IconButton
          size="large"
          color="inherit"
          disabled={uploading}
          onClick={() =>
            handleSend({
              id: id === "new" ? undefined : parseInt(id),
              title,
              content,
              type,
              labels,
            })
          }
        >
          <Send />
        </IconButton>
        <IconButton
          size="large"
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
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
          <MenuItem component={RouterLink} to={`/posts/${id}`}>
            {t("View")}
          </MenuItem>
          <MenuItem>{t("Save as draft")}</MenuItem>
          <MenuItem>{t("Delete")}</MenuItem>
        </Menu>
      </Toolbar>
      <Container
        sx={(theme) => ({
          overflowY: "auto",
          flexShrink: 0,
          mt: 2,
          "& .ql-container.ql-snow": { border: "none", margin: "0 -12px" },
          "& .ql-editor": { minHeight: "12em" },
          "& .ql-editor.ql-blank::before": {
            color: theme.palette.text.disabled,
          },
        })}
      >
        <TextField
          fullWidth
          label={t("Title")}
          variant="standard"
          size="small"
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 1 }}
        />
        <TextField
          fullWidth
          label={t("Labels")}
          variant="standard"
          size="small"
          autoComplete="off"
          value={labels.join(",")}
          onChange={(e) =>
            setLabels(e.target.value.split(",").map((s) => s.trim()))
          }
          sx={{ mb: 1 }}
        />
        <ReactQuill
          ref={quill}
          value={content}
          placeholder={t("Write something...")}
          modules={{ toolbar: "#ql-toolbar" }}
          onChange={setContent}
        />
      </Container>
      <Box
        sx={(theme) => ({
          color: theme.palette.text.primary,
          "& .ql-snow.ql-toolbar": {
            border: "none",
            borderTop: "1px solid gray",
          },
          "& .ql-snow .ql-stroke": { stroke: theme.palette.text.primary },
          "& .ql-snow .ql-fill": { fill: theme.palette.text.primary },
          "& .ql-snow .ql-picker": { color: theme.palette.text.primary },
        })}
      >
        <div id="ql-toolbar">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          <button className="ql-clean"></button>
        </div>
      </Box>
      <Box sx={{ flexBasis: "45%", flexShrink: 0, flexGrow: 1 }} />
    </div>
  );
}

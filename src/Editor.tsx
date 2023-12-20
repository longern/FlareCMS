import { ArrowBack, Send } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import type { Post } from "./PostDetail";

function Editor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const quill = React.useRef<ReactQuill | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  async function handleSend() {
    if (!content) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUploading(true);
      if (id === "new") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content, labels }),
        })
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        await res.json();
        navigate("/");
      } else {
        const res = await fetch(`/api/posts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content, labels }),
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        await res.json();
        navigate(`/posts/${id}`);
      }
    } catch (err) {
      if (err instanceof Error) console.error(err.message);
    } finally {
      setUploading(false);
    }
  }

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
        <IconButton size="large" color="inherit" component={RouterLink} to="/">
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1} textAlign="center">
          {id === "new" ? "New Post" : "Edit Post"}
        </Box>
        <IconButton
          size="large"
          color="inherit"
          disabled={uploading}
          onClick={handleSend}
        >
          <Send />
        </IconButton>
      </Toolbar>
      <Container
        sx={{
          overflowY: "auto",
          flexShrink: 0,
          mt: 2,
          "& .ql-container.ql-snow": { border: "none", margin: "0 -12px" },
          "& .ql-editor": { minHeight: "12em" },
          "& .ql-editor.ql-blank::before": {
            color: theme.palette.text.disabled,
          },
        }}
      >
        <TextField
          fullWidth
          label="Title"
          variant="standard"
          size="small"
          autoComplete="off"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 1 }}
        />
        <TextField
          fullWidth
          label="Labels"
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
          placeholder={"Write something..."}
          modules={{ toolbar: "#ql-toolbar" }}
          onChange={setContent}
        />
      </Container>
      <Box
        sx={{
          color: theme.palette.text.primary,
          "& .ql-snow.ql-toolbar": {
            border: "none",
            borderTop: "1px solid gray",
          },
          "& .ql-snow .ql-stroke": { stroke: theme.palette.text.primary },
          "& .ql-snow .ql-fill": { fill: theme.palette.text.primary },
          "& .ql-snow .ql-picker": { color: theme.palette.text.primary },
        }}
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

export default Editor;

import { ArrowBack, Image, Send } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

function Editor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { id } = useParams<{ id: string }>();
  const quill = React.useRef<ReactQuill | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  function handleSend() {
    if (!content) return;

    if (id === "new") {
      fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      })
        .then((res) => res.json())
        .then(() => navigate("/"));
    } else {
      fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      })
        .then((res) => res.json())
        .then(() => navigate("/"));
    }
  }

  function handleUploadMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    const fileType = file.type.split("/")[0];
    fetch("/api/assets", {
      method: "POST",
      body: file,
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
  }

  useEffect(() => {
    quill.current?.focus();
    if (id === "new") return;
    fetch(`/api/posts/${id}`)
      .then((res) => res.json() as Promise<{ title: string; content: string }>)
      .then((res) => {
        setTitle(res.title);
        setContent(res.content);
      });
  }, [id]);

  return (
    <div className="App">
      <Toolbar variant="dense" disableGutters>
        <IconButton size="large" color="inherit" component={RouterLink} to="/">
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1} textAlign="center">
          {id === "new" ? "New Post" : "Edit Post"}
        </Box>
        <IconButton size="large" color="inherit" onClick={handleSend}>
          <Send />
        </IconButton>
      </Toolbar>
      <Container
        sx={{
          mt: 2,
          "& .ql-container": { border: "none", margin: "0 -12px" },
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
        />
        <ReactQuill
          ref={quill}
          modules={{ toolbar: false }}
          value={content}
          placeholder={"Write something..."}
          onChange={setContent}
        />
        <IconButton component="label" size="small" color="inherit">
          <Image />
          <input
            type="file"
            accept="image/*,video/*"
            alt="Upload Media"
            hidden
            onChange={handleUploadMedia}
          />
        </IconButton>
      </Container>
    </div>
  );
}

export default Editor;

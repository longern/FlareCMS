import { ArrowBack, Send } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { Link as RouterLink } from "react-router-dom";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const Editor = () => {
  const [editor] = useState(() => withReact(createEditor()));
  return (
    <div className="App">
      <Toolbar disableGutters sx={{ height: 48 }}>
        <IconButton size="large" color="inherit" component={RouterLink} to="/">
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="large" color="inherit">
          <Send />
        </IconButton>
      </Toolbar>
      <Container sx={{ mt: 2 }}>
        <Slate editor={editor} initialValue={initialValue}>
          <Editable autoFocus />
        </Slate>
      </Container>
    </div>
  );
};

export default Editor;

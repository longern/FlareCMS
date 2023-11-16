import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link as RouterLink } from "react-router-dom";

function App() {
  const [posts, setPosts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((response) => response.json() as Promise<any>)
      .then((body) => setPosts(body.items));
  }, []);

  // handleClick function
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Blog
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleClick}
          >
            <MenuIcon />
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
            <MenuItem component={RouterLink} to="/">
              Home
            </MenuItem>
            <MenuItem component={RouterLink} to="/about">About</MenuItem>
            <MenuItem component={RouterLink} to="/posts/edit/0">New Post</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ marginTop: "1rem" }}>
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent>
              <Typography variant="h4" component="h2">
                {post.title}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {new Date(post.published).toLocaleString()}
              </Typography>
              {post.content}
            </CardContent>
          </Card>
        ))}
      </Container>
    </div>
  );
}

export default App;

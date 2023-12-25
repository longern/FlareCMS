import React from "react";

import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import {
  Outlet,
  Link as RouterLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

function Layout() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (localStorage.getItem("token")) return;
    navigate("/login");
  }, [navigate]);

  return (
    <div className="App">
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} onClick={() => setDrawerOpen(false)}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/admin/posts"
                selected={pathname === "/admin/posts"}
              >
                <ListItemText primary={t("Posts")}></ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/admin/pages"
                selected={pathname === "/admin/pages"}
              >
                <ListItemText primary={t("Pages")}></ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/admin/settings"
                selected={pathname === "/admin/settings"}
              >
                <ListItemText primary={t("Settings")}></ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/">
                <ListItemText primary={t("View blog")}></ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Outlet />
    </div>
  );
}

export default Layout;

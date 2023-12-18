import React, { useState } from "react";
import { Button, Card, CardContent, Container, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminUsername: username,
          adminPassword: password,
        }),
      });
      const json: { error: string } | { token: string } = await response.json();
      if ("error" in json) throw new Error(json.error);
      localStorage.setItem("token", json.token);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <TextField
              label="Username"
              autoComplete="username"
              variant="outlined"
              margin="normal"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              type="password"
              autoComplete="current-password"
              label="Password"
              variant="outlined"
              margin="normal"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ marginTop: "1rem" }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;

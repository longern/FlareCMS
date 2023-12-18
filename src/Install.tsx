import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { useRouteLoaderData } from "react-router-dom";

function StepCreaetSecret() {
  const [secret, setSecret] = useState("");

  useEffect(() => {
    setSecret(
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  }, []);

  return (
    <TextField
      label="Secret"
      variant="outlined"
      margin="normal"
      fullWidth
      value={secret}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <IconButton
            aria-label="copy"
            onClick={() => {
              navigator.clipboard.writeText(secret);
            }}
          >
            <ContentCopy />
          </IconButton>
        ),
      }}
      helperText="Add this secret to CloudFlare Workers environment variables as SECRET."
    />
  );
}

function StepCreateAdminAccount() {
  const [blogName, setBlogName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  function handleInstall() {
    fetch("/api/options", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blogName,
        adminUsername,
        adminPassword,
      }),
    }).then(() => {
      window.location.href = "/";
    });
  }

  return (
    <>
      <TextField
        label="Blog Name"
        autoComplete="blogName"
        variant="outlined"
        margin="normal"
        fullWidth
        value={blogName}
        onChange={(e) => setBlogName(e.target.value)}
      />
      <TextField
        label="Username"
        autoComplete="username"
        variant="outlined"
        margin="normal"
        fullWidth
        value={adminUsername}
        onChange={(e) => setAdminUsername(e.target.value)}
      />
      <TextField
        type="password"
        autoComplete="new-password"
        label="Password"
        variant="outlined"
        margin="normal"
        fullWidth
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleInstall}
      >
        Install
      </Button>
    </>
  );
}

function Install() {
  const loaderData: any = useRouteLoaderData("root");

  const defaultStep =
    "error" in loaderData && loaderData.error === "Secret not set" ? 0 : 1;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Install
          </Typography>
          <Typography variant="body1" gutterBottom>
            Welcome to your new blog!
          </Typography>
          <Stepper activeStep={defaultStep}>
            <Step>
              <StepLabel>Create a secret</StepLabel>
            </Step>
            <Step>
              <StepLabel>Create an admin account</StepLabel>
            </Step>
          </Stepper>
          {defaultStep === 0 && <StepCreaetSecret />}
          {defaultStep === 1 && <StepCreateAdminAccount />}
        </CardContent>
      </Card>
    </Container>
  );
}

export default Install;

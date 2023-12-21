import { Button, Container, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

function Settings() {
  const options = useRouteLoaderData("root") as {
    blogName?: string;
    blogDescription?: string;
  };

  const [saving, setSaving] = useState(false);
  const [blogName, setBlogName] = useState(options.blogName || "");
  const [blogDescription, setBlogDescription] = useState(
    options.blogDescription || ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          blogName,
          blogDescription,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container sx={{ py: 2 }}>
      <Typography variant="h4">Settings</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Blog Name"
          required
          variant="outlined"
          margin="normal"
          fullWidth
          value={blogName}
          onChange={(e) => setBlogName(e.target.value)}
        />
        <TextField
          label="Blog Description"
          variant="outlined"
          margin="normal"
          fullWidth
          value={blogDescription}
          onChange={(e) => setBlogDescription(e.target.value)}
        />
        <Button
          disabled={saving}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ marginTop: "1rem" }}
        >
          Save
        </Button>
      </form>
    </Container>
  );
}

export default Settings;

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        bought BOOLEAN DEFAULT FALSE
      )
    `);
    console.log("Database table ready");
  } catch (error) {
    console.error("Database init error:", error);
  }
}

app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("GET /items error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

app.post("/items", async (req, res) => {
  try {
    const { name, quantity } = req.body;

    if (!name || quantity === undefined) {
      return res.status(400).json({ error: "Name and quantity are required" });
    }

    const result = await pool.query(
      "INSERT INTO items (name, quantity) VALUES ($1, $2) RETURNING *",
      [name, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /items error:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

app.put("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE items SET bought = NOT bought WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /items/:id error:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted" });
  } catch (error) {
    console.error("DELETE /items/:id error:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.get("/", (req, res) => {
  res.send("Shopping List API is running");
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await initDb();
});
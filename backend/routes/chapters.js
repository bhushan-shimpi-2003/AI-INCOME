import express from "express";
import { query } from "../db.js";
import { ebookSections } from "../../src/ebookContent.js";

const router = express.Router();

function formatChapter(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    desc: row.description,
    readTime: row.read_time,
    blocks: row.blocks || [],
    isCustom: row.is_custom,
    updatedAt: row.updated_at
  };
}

// GET /api/chapters
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM chapters ORDER BY id ASC");
    res.json(result.rows.map(formatChapter));
  } catch (err) {
    console.error("Error fetching chapters:", err);
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

// GET /api/chapters/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await query("SELECT * FROM chapters WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.json(formatChapter(result.rows[0]));
  } catch (err) {
    console.error("Error fetching chapter:", err);
    res.status(500).json({ error: "Failed to fetch chapter" });
  }
});

// PUT /api/chapters/:id - Update chapter
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, readTime, blocks } = req.body;

    const result = await query(
      `UPDATE chapters
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           read_time = COALESCE($3, read_time),
           blocks = COALESCE($4, blocks),
           is_custom = TRUE,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        title,
        description,
        readTime,
        blocks ? JSON.stringify(blocks) : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.json(formatChapter(result.rows[0]));
  } catch (err) {
    console.error("Error updating chapter:", err);
    res.status(500).json({ error: "Failed to update chapter" });
  }
});

// POST /api/chapters - Add new custom chapter
router.post("/", async (req, res) => {
  try {
    const { title, description, readTime, blocks } = req.body;
    const maxRes = await query("SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM chapters");
    const nextId = parseInt(maxRes.rows[0].next_id, 10);

    const result = await query(
      `INSERT INTO chapters (id, title, description, read_time, blocks, is_custom, updated_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
       RETURNING *`,
      [
        nextId,
        title || `New Section ${nextId}`,
        description || "",
        readTime || "5 min",
        JSON.stringify(blocks || [])
      ]
    );

    res.status(201).json(formatChapter(result.rows[0]));
  } catch (err) {
    console.error("Error creating chapter:", err);
    res.status(500).json({ error: "Failed to create chapter" });
  }
});

// POST /api/chapters/:id/reset - Reset single chapter to default manuscript
router.post("/:id/reset", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const defaultIdx = id - 1;
    if (defaultIdx < 0 || defaultIdx >= ebookSections.length) {
      return res.status(400).json({ error: "No default manuscript exists for this chapter ID" });
    }

    const defaultSection = ebookSections[defaultIdx];
    const result = await query(
      `UPDATE chapters
       SET title = $1,
           blocks = $2,
           is_custom = FALSE,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [defaultSection.title, JSON.stringify(defaultSection.blocks || []), id]
    );

    res.json(formatChapter(result.rows[0]));
  } catch (err) {
    console.error("Error resetting chapter:", err);
    res.status(500).json({ error: "Failed to reset chapter" });
  }
});

// POST /api/chapters/reset-all - Reset all chapters to defaults
router.post("/reset-all", async (req, res) => {
  try {
    for (let i = 0; i < ebookSections.length; i++) {
      const section = ebookSections[i];
      await query(
        `UPDATE chapters
         SET title = $1,
             blocks = $2,
             is_custom = FALSE,
             updated_at = NOW()
         WHERE id = $3`,
        [section.title, JSON.stringify(section.blocks || []), i + 1]
      );
    }
    const result = await query("SELECT * FROM chapters ORDER BY id ASC");
    res.json(result.rows.map(formatChapter));
  } catch (err) {
    console.error("Error resetting all chapters:", err);
    res.status(500).json({ error: "Failed to reset all chapters" });
  }
});

export default router;

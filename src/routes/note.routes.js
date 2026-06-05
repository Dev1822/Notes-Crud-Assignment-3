const express = require("express");
const router = express.Router();

const {
  createNote,
  createBulkNotes,
  getAllNotes
} = require("../controller/note.controller");

// CRUD bulk
router.post("/bulk", createBulkNotes);

// CRUD single-item routes LAST
router.post("/", createNote);
router.get("/", getAllNotes);

module.exports = router;

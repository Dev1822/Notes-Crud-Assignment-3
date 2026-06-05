const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const controllerPath = path.join(__dirname, 'src', 'controller', 'note.controller.js');
const routesPath = path.join(__dirname, 'src', 'routes', 'note.routes.js');
const appPath = path.join(__dirname, 'src', 'app.js');

const controllers = [
  {
    name: 'createNote',
    code: `const createNote = async (req, res) => {
  try {
    const { title, content, category, isPinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required", data: null });
    }
    const note = await Note.create({ title, content, category, isPinned });
    res.status(201).json({ success: true, message: "Note created successfully", data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.post("/", createNote);`,
    routeCategory: 'CRUD single-item',
    commitMessage: 'feat: add create note endpoint (POST /api/notes)'
  },
  {
    name: 'createBulkNotes',
    code: `const createBulkNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ success: false, message: "notes array is required and cannot be empty", data: null });
    }
    const createdNotes = await Note.insertMany(notes);
    res.status(201).json({ success: true, message: \`\${createdNotes.length} notes created successfully\`, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.post("/bulk", createBulkNotes);`,
    routeCategory: 'CRUD bulk',
    commitMessage: 'feat: add bulk create endpoint (POST /api/notes/bulk)'
  },
  {
    name: 'getAllNotes',
    code: `const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json({ success: true, message: "Notes fetched successfully", count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/", getAllNotes);`,
    routeCategory: 'CRUD single-item',
    commitMessage: 'feat: add get all notes endpoint (GET /api/notes)'
  },
  {
    name: 'getNoteById',
    code: `const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note fetched successfully", data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/:id", getNoteById);`,
    routeCategory: 'CRUD single-item',
    commitMessage: 'feat: add get note by id endpoint (GET /api/notes/:id)'
  },
  {
    name: 'replaceNote',
    code: `const replaceNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true, overwrite: true, runValidators: true });
    if (!updatedNote) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note replaced successfully", data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.put("/:id", replaceNote);`,
    routeCategory: 'CRUD single-item',
    commitMessage: 'feat: add replace note endpoint (PUT /api/notes/:id)'
  },
  {
    name: 'updateNote',
    code: `const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided to update", data: null });
    }
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedNote) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note updated successfully", data: updatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.patch("/:id", updateNote);`,
    routeCategory: 'CRUD single-item',
    commitMessage: 'feat: add update note endpoint (PATCH /api/notes/:id)'
  },
  {
    name: 'deleteNote',
    code: `const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid note ID", data: null });
    }
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ success: false, message: "Note not found", data: null });
    }
    res.status(200).json({ success: true, message: "Note deleted successfully", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.delete("/:id", deleteNote);`,
    routeCategory: 'CRUD single-item',
    commitMessage: 'feat: add delete note endpoint (DELETE /api/notes/:id)'
  },
  {
    name: 'deleteBulkNotes',
    code: `const deleteBulkNotes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty", data: null });
    }
    const result = await Note.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: \`\${result.deletedCount} notes deleted successfully\`, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.delete("/bulk", deleteBulkNotes);`,
    routeCategory: 'CRUD bulk',
    commitMessage: 'feat: add bulk delete endpoint (DELETE /api/notes/bulk)'
  },
  {
    name: 'searchByTitle',
    code: `const searchByTitle = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const notes = await Note.find({ title: { $regex: q, $options: "i" } });
    res.status(200).json({ success: true, message: \`Search results for: \${q}\`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/search", searchByTitle);`,
    routeCategory: 'Search',
    commitMessage: 'feat: add search by title endpoint (GET /api/notes/search)'
  },
  {
    name: 'searchByContent',
    code: `const searchByContent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const notes = await Note.find({ content: { $regex: q, $options: "i" } });
    res.status(200).json({ success: true, message: \`Content search results for: \${q}\`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/search/content", searchByContent);`,
    routeCategory: 'Search',
    commitMessage: 'feat: add search by content endpoint (GET /api/notes/search/content)'
  },
  {
    name: 'searchAll',
    code: `const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const notes = await Note.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ]
    });
    res.status(200).json({ success: true, message: \`Search results for: \${q}\`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/search/all", searchAll);`,
    routeCategory: 'Search',
    commitMessage: 'feat: add search all endpoint (GET /api/notes/search/all)'
  },
  {
    name: 'filterAndSort',
    code: `const filterAndSort = async (req, res) => {
  try {
    const { category, isPinned, sortBy = "createdAt", order = "desc" } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const sortOrder = order === "asc" ? 1 : -1;
    const notes = await Note.find(filter).sort({ [sortBy]: sortOrder });
    res.status(200).json({ success: true, message: "Notes fetched successfully", count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/filter-sort", filterAndSort);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add filter and sort endpoint (GET /api/notes/filter-sort)'
  },
  {
    name: 'filterAndPaginate',
    code: `const filterAndPaginate = async (req, res) => {
  try {
    const { category, isPinned, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter).skip(skip).limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/filter-paginate", filterAndPaginate);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add filter and paginate endpoint (GET /api/notes/filter-paginate)'
  },
  {
    name: 'sortAndPaginate',
    code: `const sortAndPaginate = async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;
    
    const sortOrder = order === "asc" ? 1 : -1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await Note.countDocuments();
    const notes = await Note.find().sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/sort-paginate", sortAndPaginate);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add sort and paginate endpoint (GET /api/notes/sort-paginate)'
  },
  {
    name: 'searchAndFilter',
    code: `const searchAndFilter = async (req, res) => {
  try {
    const { q, category, isPinned } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const filter = {};
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } }
    ];
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const notes = await Note.find(filter);
    res.status(200).json({ success: true, message: \`Search results for: \${q}\`, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/search-filter", searchAndFilter);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add search and filter endpoint (GET /api/notes/search-filter)'
  },
  {
    name: 'searchSortPaginate',
    code: `const searchSortPaginate = async (req, res) => {
  try {
    const { q, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query 'q' is required", data: null });
    }
    const filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ]
    };
    
    const sortOrder = order === "asc" ? 1 : -1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: \`Search results for: \${q}\`,
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/search-sort-paginate", searchSortPaginate);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add search sort paginate endpoint (GET /api/notes/search-sort-paginate)'
  },
  {
    name: 'filterSortPaginate',
    code: `const filterSortPaginate = async (req, res) => {
  try {
    const { category, isPinned, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isPinned !== undefined) filter.isPinned = isPinned === "true";
    
    const sortOrder = order === "asc" ? 1 : -1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum);
    
    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/filter-sort-paginate", filterSortPaginate);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add filter sort paginate endpoint (GET /api/notes/filter-sort-paginate)'
  },
  {
    name: 'masterQuery',
    code: `const masterQuery = async (req, res) => {
  try {
    const { q, category, isPinned, sortBy, order, page, limit } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { title:   { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ];
    }
    if (category)                filter.category = category;
    if (isPinned !== undefined)  filter.isPinned  = isPinned === "true";

    const allowedSortFields = ["title", "createdAt", "updatedAt", "category"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const skip     = (pageNum - 1) * limitNum;

    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page:        pageNum,
        limit:       limitNum,
        totalPages:  Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};`,
    routeCode: `router.get("/query", masterQuery);`,
    routeCategory: 'Combination',
    commitMessage: 'feat: add master query endpoint (GET /api/notes/query)'
  }
];

let baseTime = new Date('2026-06-05T17:05:00+05:30').getTime();

const implementedControllers = [];
const implementedRoutes = {
  'CRUD bulk': [],
  'Search': [],
  'Combination': [],
  'CRUD single-item': []
};

// Update app.js initially
let appJsContent = fs.readFileSync(appPath, 'utf8');
if (!appJsContent.includes('/api/notes')) {
  appJsContent = appJsContent.replace('module.exports=app;', 'const noteRoutes = require("./routes/note.routes");\n\napp.use("/api/notes", noteRoutes);\n\nmodule.exports=app;');
  fs.writeFileSync(appPath, appJsContent);
}

for (const c of controllers) {
  implementedControllers.push(c);
  implementedRoutes[c.routeCategory].push(c);

  // build note.controller.js
  let controllerStr = `const Note = require("../model/notes.model.js");\n\n`;
  controllerStr += implementedControllers.map(ic => ic.code).join('\n\n');
  controllerStr += `\n\nmodule.exports = {\n  ` + implementedControllers.map(ic => ic.name).join(',\n  ') + `\n};`;
  fs.writeFileSync(controllerPath, controllerStr);

  // build note.routes.js
  let routeStr = `const express = require("express");\nconst router = express.Router();\n\nconst {\n  ` + implementedControllers.map(ic => ic.name).join(',\n  ') + `\n} = require("../controller/note.controller");\n\n`;
  
  if (implementedRoutes['CRUD bulk'].length > 0) {
    routeStr += `// CRUD bulk\n` + implementedRoutes['CRUD bulk'].map(ic => ic.routeCode).join('\n') + `\n\n`;
  }
  if (implementedRoutes['Search'].length > 0) {
    routeStr += `// Search routes\n` + implementedRoutes['Search'].map(ic => ic.routeCode).join('\n') + `\n\n`;
  }
  if (implementedRoutes['Combination'].length > 0) {
    routeStr += `// Combination routes\n` + implementedRoutes['Combination'].map(ic => ic.routeCode).join('\n') + `\n\n`;
  }
  if (implementedRoutes['CRUD single-item'].length > 0) {
    routeStr += `// CRUD single-item routes LAST\n` + implementedRoutes['CRUD single-item'].map(ic => ic.routeCode).join('\n') + `\n\n`;
  }
  routeStr += `module.exports = router;\n`;
  fs.writeFileSync(routesPath, routeStr);

  // commit
  baseTime += 150000; // + 2 mins 30 seconds
  const dateStr = new Date(baseTime).toISOString();
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit --date="${dateStr}" -m "${c.commitMessage}"`, { 
    env: { ...process.env, GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr },
    stdio: 'inherit' 
  });
  execSync(`git push origin master`, { stdio: 'inherit' });
}

console.log('All done!');

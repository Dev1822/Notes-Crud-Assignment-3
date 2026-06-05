require("dotenv").config();
const express=require("express");

const app=express();
app.use(express.json())

const noteRoutes = require("./routes/note.routes");

app.use("/api/notes", noteRoutes);

module.exports=app;
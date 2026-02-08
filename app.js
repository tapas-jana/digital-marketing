const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ======================
// View engine
// ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ======================
// Middleware
// ======================
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.title = "Digital Marketing Agency";
  next();
});

// ======================
// Routes
// ======================
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/services", (req, res) => {
  res.render("services");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// ======================
// CONTACT FORM → SAVE TO CSV
// ======================
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const dataDir = path.join(__dirname, "data");
  const csvFile = path.join(dataDir, "contacts.csv");

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Add CSV header if file does not exist
  if (!fs.existsSync(csvFile)) {
    fs.writeFileSync(
      csvFile,
      "Date,Name,Email,Message\n",
      { flag: "a" }
    );
  }

  // Escape quotes for CSV safety
  const cleanMessage = message.replace(/"/g, '""');

  const row = `"${new Date().toISOString()}","${name}","${email}","${cleanMessage}"\n`;

  fs.appendFile(csvFile, row, (err) => {
    if (err) {
      console.error("CSV write error:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/thank-you");
  });
});

app.get("/thank-you", (req, res) => {
  res.render("thank-you");
});

// ======================
// Start server
// ======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


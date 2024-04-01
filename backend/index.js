const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/attendanceDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// Define Schema for attendance data
const attendanceSchema = new mongoose.Schema({
  fullName: String,
  event: String,
  date: Date,
  status: String, // "present" or "absent"
});

// Define Schema for attendance data
const memberSchema = new mongoose.Schema({
  fullName: String,
  branch: String,
  section: String,
  year: String,
  urn: Number,
  crn: Number,
  img: String,
});

// Create Model for attendance collection
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Create Model for members collection
const Member = mongoose.model("Member", memberSchema);

// Route to record attendance
app.post("/record-attendance", async (req, res) => {
  try {
    const { fullName, date, status, event } = req.body;
    const existingRecord = await Attendance.findOne({ fullName, date });
    if (existingRecord) {
      return res.status(400).json({
        message: "Attendance already recorded for this user on this date.",
      });
    }
    const attendanceRecord = new Attendance({
      fullName,
      event,
      date,
      status,
    });
    await attendanceRecord.save();
    res.status(201).json({ message: "Attendance recorded successfully." });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ error: "Failed to record attendance." });
  }
});

// Route to get attendance for a specific user
app.post("/attendance", async (req, res) => {
  try {
    const { fullName } = req.body;
    const userAttendance = await Attendance.find({ fullName: fullName });
    res.json(userAttendance);
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ error: "Failed to retrieve attendance." });
  }
});

app.post("/attendanceByDate", async (req, res) => {
  try {
    const inputDate = req.body.date;
    const userAttendance = await Attendance.find({ date: inputDate });
    res.json(userAttendance);
  } catch (error) {
    console.error("Error retrieving attendance:", error);
    res.status(500).json({ error: "Failed to retrieve attendance." });
  }
});

app.post("/register", upload.single("photo"), async (req, res) => {
  const { fullName, branch, year, section, urn, crn } = req.body;
  const photoPath = req.file ? req.file.path : null;

  const newMember = new Member({
    fullName,
    branch,
    section,
    year,
    urn,
    crn,
    img: photoPath,
  });
  await newMember.save();
  res
    .status(201)
    .json({ message: "Member registered successfully", member: newMember });
});

app.get("/members", async (req, res) => {
  const MemberList = await Member.find();
  res.json(MemberList);
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

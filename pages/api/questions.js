import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = path.join(process.cwd(), "data", "questions.json");
  const raw = fs.readFileSync(file, "utf8");
  const questions = JSON.parse(raw);
  res.status(200).json(questions);
}
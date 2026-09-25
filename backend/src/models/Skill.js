import mongoose from "mongoose";

const SKILL_CATEGORIES = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Language",
  "Music",
  "Other",
];

const skillSchema = new mongoose.Schema(
  {
    name: {
  type: String,
  required: [true, "Skill name is required"],
  trim: true,
  minlength: [2, "Skill name must be at least 2 characters"],
  maxlength: [50, "Skill name cannot exceed 50 characters"],
},
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: SKILL_CATEGORIES,
        message: "Category must be one of: " + SKILL_CATEGORIES.join(", "),
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

// Case-insensitive uniqueness: without this, "React" and "react" would be
// treated as two different documents by MongoDB's default unique index,
// which defeats the whole point of a shared catalog.
skillSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

const Skill = mongoose.model("Skill", skillSchema);

export { SKILL_CATEGORIES };
export default Skill;
import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    repo: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    summaryContent: {
      type: String,
      required: true,
    },
    // Useful for forcing a refresh if the cache gets too old
    lastGenerated: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

// Create a compound index so we can efficiently look up by owner/repo
summarySchema.index({ owner: 1, repo: 1 }, { unique: true });

export default mongoose.model("Summary", summarySchema);

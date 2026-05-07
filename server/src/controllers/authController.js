import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "reposense_secret_key";
const JWT_EXPIRES_IN = "7d";

// In-memory user storage for when MongoDB is not available
const inMemoryUsers = new Map();

const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Helper function to create user in memory or MongoDB
const createOrUpdateUser = async (userData) => {
  try {
    // Try MongoDB first
    const user = await User.create(userData);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      source: "mongodb"
    };
  } catch (error) {
    // Fallback to in-memory storage
    const userId = Date.now().toString();
    const user = {
      id: userId,
      ...userData,
      source: "memory",
      createdAt: new Date()
    };
    inMemoryUsers.set(userId, user);
    return user;
  }
};

// Helper function to find user by email
const findUserByEmail = async (email) => {
  try {
    // Try MongoDB first
    const user = await User.findOne({ email });
    if (user) {
      return {
        id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        source: "mongodb"
      };
    }
  } catch (error) {
    // Continue to in-memory search
  }
  
  // Fallback to in-memory storage
  for (const [userId, user] of inMemoryUsers.entries()) {
    if (user.email === email) {
      return {
        ...user,
        id: userId
      };
    }
  }
  return null;
};

// Helper function to compare password
const comparePassword = async (candidatePassword, hashedPassword) => {
  try {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(candidatePassword, hashedPassword);
  } catch (error) {
    // For in-memory users, compare directly (not secure for production)
    return candidatePassword === hashedPassword;
  }
};

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    // Hash password for MongoDB users
    let hashedPassword = password;
    try {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      // For in-memory, keep password as-is (not secure for production)
    }

    // Create user
    const user = await createOrUpdateUser({ username, email, password: hashedPassword });
    const token = signToken(user.id);

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user.id);

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    let user;
    try {
      // Try MongoDB first
      user = await User.findById(decoded.id).select("-password");
      if (user) {
        user = {
          id: user._id,
          username: user.username,
          email: user.email
        };
      }
    } catch (error) {
      // Fallback to in-memory storage
      const memoryUser = inMemoryUsers.get(decoded.id);
      if (memoryUser) {
        user = {
          id: decoded.id,
          username: memoryUser.username,
          email: memoryUser.email
        };
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

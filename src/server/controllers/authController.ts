import type User from "../models/User";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const users: User[] = [];
const JWT_SECRET = "your-secret-key"; // In production, use environment variables

export const register = async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    if (users.find((user) => user.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: users.length + 1,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    // Add user to array (in real app, save to database)
    users.push(newUser);

    // Create and return JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find((user) => user.email === email);

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

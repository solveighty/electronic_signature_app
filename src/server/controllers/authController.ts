import type User from "../models/User";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../utils/supabase";
import { Request, Response } from "express";
import "dotenv/config";

const users: User[] = [];
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .schema("public")
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser: User = {
      id: uuidv4(), // Generate unique ID
      name,
      email,
      password: hashedPassword,
    };

    // Add user to array (in real app, save to database)
    users.push(newUser);

    const supabaseResponse = await supabase
      .schema("public")
      .from("users")
      .insert({
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        password: hashedPassword, // In production, do not store plain passwords
      });

    if (supabaseResponse.error) {
      console.error("Error inserting user:", supabaseResponse.error);
      return res.status(500).json({ message: "Error inserting user" });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    res
      .status(500)
      .json({ message: (error as Error).message || "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // Check if user exists
    if (fetchError || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

import type User from "../models/User";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../utils/supabase";
import { Request, Response } from "express";
import { generateVerificationCode } from "../utils/codeGenerator";
import { sendVerificationEmail } from "../utils/emailService";
import {
  storeVerificationCode,
  verifyCode,
  getVerificationData,
} from "../utils/verificationStore";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

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

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code and user data temporarily
    storeVerificationCode(email, verificationCode, name);

    // Send verification email
    await sendVerificationEmail({
      email,
      name,
      verificationCode,
    });

    res.status(200).json({
      message:
        "Verification code sent to your email. Please check your inbox and verify your account.",
      email,
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

export const verifyRegistration = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode, password } = req.body;

    // Validate required fields
    if (!email || !verificationCode || !password) {
      return res.status(400).json({
        message: "Email, verification code, and password are required",
      });
    }

    // Get verification data
    const verificationData = getVerificationData(email);
    if (!verificationData) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    // Verify the code
    const isCodeValid = verifyCode(email, verificationCode);
    if (!isCodeValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    // Create new user
    const newUser: User = {
      id: uuidv4(), // Generate unique ID
      name: verificationData.name,
      email,
      password: hashedPassword,
      isVerified: true,
    };

    // Save user to database
    const supabaseResponse = await supabase
      .schema("public")
      .from("users")
      .insert({
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        password: hashedPassword,
        is_verified: true,
      });

    if (supabaseResponse.error) {
      console.error("Error inserting user:", supabaseResponse.error);
      return res.status(500).json({ message: "Error creating user account" });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "Account verified and created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: true,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    res
      .status(500)
      .json({ message: (error as Error).message || "Server error" });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if there's existing verification data
    const existingData = getVerificationData(email);
    if (!existingData) {
      return res.status(400).json({
        message:
          "No pending verification found for this email. Please register first.",
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Store new verification code
    storeVerificationCode(email, verificationCode, existingData.name);

    // Send verification email
    await sendVerificationEmail({
      email,
      name: existingData.name,
      verificationCode,
    });

    res.status(200).json({
      message: "New verification code sent to your email.",
      email,
    });
  } catch (error: unknown) {
    console.error(error);
    res
      .status(500)
      .json({ message: (error as Error).message || "Server error" });
  }
};

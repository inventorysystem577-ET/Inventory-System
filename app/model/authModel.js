// app/models/authModel.js
import { supabase } from "../../lib/supabaseClient";

/**
 * Login using Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} data containing { user, session }
 */
export const loginUserModel = async (email, password) => {
  if (!email || !password) throw new Error("Email and Password are required");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data; // { user, session }
};

/**
 * Forgot Password using Supabase Auth
 * @param {string} email
 * @returns {Promise<object>} data
 */
export const forgotPasswordModel = async (email) => {
  if (!email) throw new Error("Email is required");

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Register using Supabase Auth
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.role
 * @returns {Promise<object>} data
 */
export const registerUserModel = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role)
    throw new Error("All fields are required");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role }, // custom user metadata
    },
  });

  if (error) throw new Error(error.message);
  return data; // { user }
};

/**
 * Reset Password using Supabase Auth
 * @param {string} newPassword
 * @returns {Promise<object>} data
 */
export const resetPasswordModel = async (newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw new Error(error.message);
  return data;
};

"use server";

import { redirect } from "next/navigation";

import { createUser, getUserByEmail } from "@/lib/user";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createAuthSession, destroyAuthSession } from "@/lib/auth";

function getFormData(formData) {
  const email = formData.get("email").trim();
  const password = formData.get("password").trim();

  return { email, password };
}

function formValidation(email, password) {
  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter valid email address";
  }

  if (password.length < 8) {
    errors.password = "Password must have at least 8 characters";
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }
}

export async function signup(prevState, formData) {
  const { email, password } = getFormData(formData);

  const errors = formValidation(email, password);

  if (errors) {
    console.log(errors);
    return { errors };
  }

  const hash = hashUserPassword(password);

  try {
    const id = createUser(email, hash);
    await createAuthSession(id);
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "It seems this email is already in use.",
        },
      };
    }
    throw error;
  }
}

export async function login(prevState, formData) {
  const { email, password } = getFormData(formData);

  const errors = formValidation(email, password);

  if (errors) {
    return { errors };
  }

  const existingUser = getUserByEmail(email);

  const isVerified = verifyPassword(existingUser.password, password);

  if (!isVerified) {
    return {
      errors: {
        email: "It seems this email or password is incorrect",
      },
    };
  }

  await createAuthSession(existingUser.id);
  redirect("/training");
}

export async function logout() {
  const hasError = await destroyAuthSession();

  if (hasError) {
    throw hasError;
  }

  redirect("/");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }

  return signup(prevState, formData);
}

"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function signUp(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createServerActionClient({ cookies });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }

  if (data.user) {
    // Insert user data into public.User table
    const { error: insertError } = await supabase
      .from("User")
      .insert({ id: data.user.id, username: username });

    if (insertError) {
      console.error("Error inserting user into public.User:", insertError);
      return { success: false, error: "Failed to create user profile." };
    }
    return { success: true };
  }

  return { success: false, error: "An unexpected error occurred during sign up." };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createServerActionClient({ cookies });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
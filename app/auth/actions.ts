"use server";

import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation'
import { revalidatePath } from "next/cache";

export async function signUp(formData: FormData) {
  const cookieStore = await cookies();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  )

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
    const { error: insertUserError } = await supabase
      .from("User")
      .insert({ id: data.user.id, username: username });

    if (insertUserError) {
      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (insertUserError.code === "23505") {
        console.error(
          "Username uniqueness violation:",
          insertUserError
        );
        return { success: false, error: "Email/username already exists." };
      }
      console.error("Error inserting user into public.User:", insertUserError);
      return { success: false, error: "Failed to create user profile." };
    }

    // Also create an entry in the public.profiles table
    const { error: insertProfileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id }); // mal_username can be null initially

    if (insertProfileError) {
      console.error("Error inserting user into public.profiles:", insertProfileError);
      return { success: false, error: "Failed to create user profile entry." };
    }

    return { success: true };
  }

  return { success: false, error: "An unexpected error occurred during sign up." };
}

export async function signIn(formData: FormData) {
  const cookieStore = await cookies();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/swipe'); // Revalidate the swipe page after successful sign-in
  redirect('/swipe')
}
export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  )

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  redirect('/');
}
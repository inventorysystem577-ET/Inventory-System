import { supabase } from "@/lib/supabaseClient";
// or if lib is inside app folder: import { supabase } from "@/app/lib/supabaseClient";

// REGISTER USER
export const registerUser = async ({ name, email, password, role }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

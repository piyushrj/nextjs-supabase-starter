import SignOutButton from "@/components/auth/signOutButton";
import { createClient } from "@/utils/supabase/server";



export default async function Home() {
  const supabase = createClient()

  // get the user 
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Hello, World!</h1>
        <p>{user?.email}</p>
        <SignOutButton />
      </div>
    </main>
  );
}

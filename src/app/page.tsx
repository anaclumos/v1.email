import { GitHub } from "@/components/icons/github";
import { createClient } from "@/utils/supabase/server";
import { signInWithGitHub } from "@/app/sign-in/action";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit";
import { WandSparkles } from "lucide-react";

const createChat = async (formData: FormData) => {
  "use server";
  const supabase = createClient();
  const prompt = formData.get("prompt");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .insert([{ owned_by: user?.id, title: prompt }])
    .select();

  if (chatError) {
    console.error(chatError);
  }

  const { error: messageError } = await supabase
    .from("messages")
    .insert([
      {
        chat_id: chatData?.[0]?.id,
        sent_by: user?.id,
        prompt,
      },
    ])
    .select();

  if (messageError) {
    console.error(messageError);
  }

  redirect(`/chat/${chatData?.[0].id}`);
};

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = Boolean(user);
  return (
    <>
      <div className="text-center gap-2 m-16 mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter">
          What email do you want to create?
        </h1>
        <p className="mx-auto max-w-[700px] text-white md:text-xl"></p>
      </div>
      {signedIn ? (
        <form
          action={createChat}
          className="flex flex-col max-w-sm mx-auto gap-2"
        >
          <Input placeholder="A user sign-up welcome email..." name="prompt" />
          <SubmitButton>
            <WandSparkles className="size-4" />
            Imagine
          </SubmitButton>
        </form>
      ) : (
        <form
          action={signInWithGitHub}
          className="flex flex-col max-w-sm mx-auto gap-2"
        >
          <Input placeholder="A user sign-up welcome email..." />
          <SubmitButton>
            <GitHub className="size-4" />
            Sign in with GitHub
          </SubmitButton>
        </form>
      )}
    </>
  );
}

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHub } from "@/components/icons/github";
import { signInWithGitHub } from "./action";

export default function Component() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Sign in
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your GitHub account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={signInWithGitHub}>
            <Button className="w-full" type="submit">
              <GitHub className="mr-2 size-4" />
              GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

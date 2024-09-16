"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Updated simulated data for recently built emails
const recentEmails = [
  {
    id: 1,
    description: "Welcome email for new users",
    image: "/placeholder.svg?height=100&width=200",
    user: {
      name: "Alice",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    prompt:
      "Create a friendly welcome email for new users of our SaaS platform",
  },
  {
    id: 2,
    description: "Monthly newsletter template",
    image: "/placeholder.svg?height=100&width=200",
    user: {
      name: "Bob",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    prompt:
      "Design a monthly newsletter template with sections for updates, tips, and user spotlight",
  },
  {
    id: 3,
    description: "Product launch announcement",
    image: "/placeholder.svg?height=100&width=200",
    user: {
      name: "Charlie",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    prompt:
      "Craft an exciting product launch announcement email for our new feature",
  },
  {
    id: 4,
    description: "Customer feedback survey",
    image: "/placeholder.svg?height=100&width=200",
    user: {
      name: "Diana",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    prompt:
      "Design a concise customer feedback survey email to improve our service",
  },
];

function EmailGallery({ emails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {emails.map((email) => (
        <Card key={email.id} className="overflow-hidden">
          <CardContent className="p-0">
            <img
              src={email.image}
              alt={email.description}
              className="w-full h-auto"
            />
            <div className="p-4">
              <p className="font-semibold mb-2">{email.description}</p>
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={email.user.avatar} alt={email.user.name} />
                  <AvatarFallback>{email.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg text-sm flex-1 relative">
                  <div className="absolute w-3 h-3 bg-muted rotate-45 -left-1.5 top-4"></div>
                  {email.prompt}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function EmailBuilder() {
  const [emailDescription, setEmailDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the email description to your backend
    console.log("Building email:", emailDescription);
    setEmailDescription("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Email Builder SaaS
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What Email Do You Want to Build?</CardTitle>
          <CardDescription>
            Describe the email you want to create and we'll generate it for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Input
              type="text"
              value={emailDescription}
              onChange={(e) => setEmailDescription(e.target.value)}
              placeholder="E.g., Welcome email for new customers"
              className="flex-grow"
            />
            <Button type="submit">Build Email</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Recently Built Emails</h2>
      <EmailGallery emails={recentEmails} />
    </div>
  );
}

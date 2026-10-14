"use client";

import { delay } from "@/app/lib/utils/delay";
import { useRouter } from "next/dist/client/components/navigation";
import { useState, SubmitEvent } from "react";

export default function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const [outputMessageColor, setOutputMessageColor] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (password !== confirmPassword) {
        setOutputMessageColor("red");
        setOutputMessage("Passwords do not match.");
        return;
      }

      const response = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          email,
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        setOutputMessageColor("red");
        setOutputMessage(
          "Signup failed. Please check your username and password."
        );
        return;
      }
      setOutputMessageColor("green");
      setOutputMessage("Account Created Successfully!");
      const userId = await response.json();
      console.log("Signup successful! User ID:", userId);
      await delay(2000);
      router.push(`/`); // Redirect to the login page after successful signup
    } catch (error) {
      console.error("Signup failed:", error);
      setOutputMessageColor("red");
      setOutputMessage(
        "Signup failed. Please check your username and password."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-4 self-center rounded-md border-2 border-[#ff6a00] p-4 shadow-md flex-col items-start"
    >
      <div className="flex items-center">
        <label className="w-25 font-bold">UserName:</label>
        <input
          className="rounded border-1 border-[#ff6a00]"
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          placeholder="Username"
          maxLength={30}
        />
      </div>

      <div className="flex items-center">
        <label className="w-25 font-bold">Password:</label>
        <input
          className="rounded border-1 border-[#ff6a00]"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="Password"
          maxLength={20}
        />
      </div>

      <div className="flex items-center">
        <label className="w-25 font-bold">Confirm Password:</label>
        <input
          className="rounded border-1 border-[#ff6a00]"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          placeholder="Confirm Password"
          maxLength={20}
        />
      </div>

      <div className="flex items-center">
        <label className="w-25 font-bold">Email:</label>
        <input
          className="rounded border-1 border-[#ff6a00]"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          maxLength={50}
        />
      </div>

      <div className="flex items-center">
        <label className="w-25 font-bold">First Name:</label>
        <input
          className="rounded border-1 border-[#ff6a00]"
          type="text"
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
          placeholder="First Name"
          maxLength={30}
        />
      </div>

      <div className="flex items-center">
        <label className="w-25 font-bold">Last Name:</label>
        <input
          className="rounded border-1 border-[#ff6a00]"
          type="text"
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
          placeholder="Last Name"
          maxLength={30}
        />
      </div>
      <div className="flex gap-4 self-center">
        <button
          className="rounded border-1 border-[#ff6a00] p-2 hover:bg-[#ff6a00] font-bold hover:text-white"
          type="submit"
        >
          Sign Up
        </button>
        <button
          className="rounded border-1 border-[#ff6a00] p-2 hover:bg-[#ff6a00] font-bold hover:text-white"
          type="button"
          onClick={() => {
            router.push("/");
          }}
        >
          Cancel
        </button>
      </div>
      <p
        className="font-bold self-center"
        style={{
          color: outputMessageColor,
        }}
      >
        {outputMessage}
      </p>
    </form>
  );
}

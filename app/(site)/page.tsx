"use client"
import Image from "next/image";
import AuthForm from "../components/AuthForm";



export default function Home() {
  return (
    <div className="flex min-h-full flex-col py-10 justify-center sm:px-6 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/images/logo.png"
          alt="logo"
          width={48}
          height={48}
          className="mx-auto w-auto"
        />
        <h2 className="mt-0 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign into your account
        </h2>
      </div>
      <AuthForm />
    </div>
  );
}

"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import useAuth from "@/hooks/useAuth";
import Head from "next/head";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface Inputs {
  email: string;
  password: string;
}

type Props = {};

const Login = (props: Props) => {
  const [login, setLogin] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    if (login) {
      setLoading(true);
      await signIn(email, password);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[100vh] w-full">
      <Head>
        <title>Login - Messaging</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form
        className="relative mt-24 space-y-8 flex flex-col justify-center items-center bg-black/75 md:mt-0 md:max-w-md md:px-14 border-2 border-white shadow-md rounded-lg py-10 px-5 "
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center justify-center w-full font-inter font-semibold text-3xl leading-11 text-[white]">
          Login
        </div>
        <div className="space-y-4">
          <label className="inline-block w-full">
            <input
              type="email"
              placeholder="Email"
              className="input"
              {...register("email", { required: true })}
            />
          </label>

          <label className="inline-block w-full">
            <input
              type="password"
              placeholder="Password"
              className="input"
              {...register("password", { required: true })}
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-3/4 rounded-lg py-3 font-semibold bg-gradient-to-br from-green-400 via-teal-400 to-blue-300 shadow-md"
          onClick={() => setLogin(true)}
          disabled={loading ? true : false}
        >
          {loading ? <LoadingSpinner /> : "Login"}
        </button>

        <div className="">
          New to messaging app?{" "}
          <button
            className="text-white hover:underline"
            onClick={() => router.push("/signup")}
          >
            Sign up now
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;

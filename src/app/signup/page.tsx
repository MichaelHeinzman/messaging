"use client";

import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Head from "next/head";
import { checkUsernameExists } from "@/firestore/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import useAuth from "@/hooks/useAuth";
interface Inputs {
  id?: string;
  email: string;
  photoURL: string;
  username: string;
  password: string;
}

type Props = {};
const Signup = (props: Props) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>();

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setValue("photoURL", result);
      }
    };
    reader.readAsDataURL(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
  });

  const onSubmit: SubmitHandler<Inputs> = async ({
    email,
    password,
    username,
    photoURL,
  }) => {
    setLoading(true);
    // Check if the username already exists
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      setLoading(false);
      // Username already exists, show an error message or take appropriate action
      console.log("Username already exists");
      return;
    }
    await signUp(email, password, username, photoURL);
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center h-[100vh] w-full">
      <Head>
        <title>Create Profile - Messaging</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form
        className="relative mt-24 space-y-8 flex flex-col justify-center items-center bg-black/75 md:mt-0 md:max-w-md md:px-14 border-2 border-white shadow-md rounded-lg py-10 px-5 "
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center justify-center w-full font-inter font-semibold text-3xl leading-11 text-[white]">
          Create Profile
        </div>
        <div className="space-y-4">
          <label className="inline-block w-full">
            <div
              {...getRootProps()}
              className="rounded-full h-32 w-32 cursor-pointer"
              onClick={open}
            >
              <input {...getInputProps()} />
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="profile"
                  className="rounded-full h-32 w-32"
                />
              ) : (
                <span>Drag and drop or click to upload profile picture</span>
              )}
            </div>
          </label>
        </div>
        <div className="space-y-4">
          <label className="inline-block w-full">
            <input
              type="text"
              placeholder="Username"
              className="input"
              {...register("username", { required: true })}
            />
          </label>
        </div>
        <div className="space-y-4">
          <label className="inline-block w-full">
            <input
              type="text"
              placeholder="Email"
              className="input"
              {...register("email", { required: true })}
            />
          </label>
        </div>
        <div className="space-y-4">
          <label className="inline-block w-full">
            <input
              type="text"
              placeholder="Password"
              className="input"
              {...register("password", { required: true })}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-3/4 rounded-lg py-3 font-semibold bg-gradient-to-br from-green-400 via-teal-400 to-blue-300 shadow-md"
        >
          {loading ? <LoadingSpinner /> : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default Signup;

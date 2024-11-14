"use client";
import useConversation from "@/app/hooks/useConversation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import React from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import MessageInput from "./MessageInput";

const Form = () => {
  const { conversationId } = useConversation();
  const { register, handleSubmit, setValue, formState: {errors} } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", {shouldValidate:true});
    axios.post("/api/messages", {
      ...data,
      conversationId,
    });
  };
  return (
    <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
        <HiPhoto  size={30} className="text-sky-500"/>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
        />
        <Button
          type="submit"
          className="bg-sky-500 text-white py-2 px-4 rounded-full hover:bg-sky-600 transition cursor-pointer"    
        >
         <HiPaperAirplane size={30} className="text-white"/>
        </Button>
      </form>
    </div>
  );
};

export default Form;

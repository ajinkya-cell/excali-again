"use client"
import Link from "next/link";
import { Button } from "@/components/Button";
import {useForm ,SubmitHandler } from "react-hook-form"
import axios from "axios";
import { useRouter } from "next/navigation";
import { http } from "@/components/endpoints";


export default function Signup() {

  const router =  useRouter()

  type form={
    email:string,
    password:string
  }

  const {register,handleSubmit, formState: { errors,isSubmitting }} = useForm<form>();
  const onsubmit: SubmitHandler<form> = async(data)=>{
  try{
      const response = await axios.post(http+"/signIn",{
        password:data.password,
        email:data.email
      })
      if(response.data.msg ="logged in"){
        localStorage.setItem('jwtToken', response.data.token);
        router.push('/Dashboard')
      }
    }catch(e){
      console.log(e);
    }
  }

  return <div className="w-full h-screen bg-gradient-to-b from-[#120066] from-[-54.58%] to-black">
          <div className="flex w-full h-full justify-center">
        <div className="flex flex-col justify-center items-center gap-6">
            <div>
            <h1 className={`font-serif text-xl`} >Playboard</h1>
            </div>
            <form onSubmit={handleSubmit(onsubmit)}>
            <div>
                <h2 className={`font-sans mb-2`}>Email Address</h2>
                <input {...register("email",{
                required:"email is required",
                pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                message: "Invalid email address",
                },})} 
                className="h-[42px] bg-[#0E033F] border-2 px-2 text-white border-[#2B316D] w-[300px] rounded-md" type="text" />
                {errors.email && <h2 className="text-red-400">{errors.email.message}</h2>}
            </div>
            <div>
                <h2 className={`font-sans mb-2`}> Password</h2>
                <input 
                type="password"
                {...register("password",{
                 minLength:{value:6,message:"atleast 6 letters"},
                })}
                className="h-[42px] bg-[#0E033F] border-2 px-2 text-white border-[#2B316D] w-[300px] rounded-md"  />
                {errors.password && <h2 className="text-red-400">{errors.password.message}</h2>}
            </div>
                <div className="mt-4">
                  <Button btndisable={isSubmitting} btnscale={false} btnsize="larger" prop="blue" content={isSubmitting ? "Submitting":"Sign-in"}/>
                </div>
            </form>
            <div className="flex gap-2">
                <h2 className={`font-sans text-md`}> Already have accound ?</h2> 
                <Link href="/Signup">
                <h2 className={`font-sans text-md text-[#0099ff] hover:text-white hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300 cursor-pointer` }> Signup</h2>
                </Link>
            </div>
        </div>
      </div>
  </div>;
}
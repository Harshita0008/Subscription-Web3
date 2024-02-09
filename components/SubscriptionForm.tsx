/* eslint no-use-before-define: 0 */  // --> OFF"
/* eslint-disable padded-blocks */
"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useContractWrite, useAccount, useNetwork } from "wagmi";
import AutoPayABI from "../constants/ABI/AutoPay.json";
import TokenABI from "../constants/ABI/Token.json";
import { useEffect, useState } from "react";
import Addresses from "../constants/Addresses/Address.json";
import ChatIDAddress from "../UserIDToAddress.json"
import { AlertTitle } from "./ui/alert";

const formSchema = z.object({
  merchant : z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  Payee: z.string().optional(),
  token: z.string().optional(),
  subscription_cost: z.string().optional(),
  frequency: z.enum(["Daily", "Weekly", "Monthly"]),
  subscription_period:  z.string().min(1, {
    message: "subscription_period is a required field",
  }),

});

interface Product {
  product_id: string;
  user_id: string;
  price_amount_usd: number;
  title: string;
  description: string;
  name: string;
  email: string;
  phone: string;
  address?: string; // Optional property
}

const SubscriptionForm = () => {
  const { address, isConnected } = useAccount();
  const [tokenAddress, setTokenAddress] = useState<any>('0x20a3a8d43f3c8cb74df847ad75a87cbe69c58427');
  const [merchants, setMerchants] = useState<Product[] |null>(null);
  const [currentMerchant, setCurrentMerchant] = useState<Product | null>(null);

  async function triggerBot() {
    const BOT_TOKEN = "6842185772:AAFfBpgr7iapNPqEwrS0kX-apRHKl1gRs-w";
    const chat_ids = Object.keys(ChatIDAddress);

    for (const CHAT_ID of chat_ids) {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `${address} has created an subscription`,
        }),
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log("Message sent to bot:", data);
      } catch (error) {
        console.error("Error sending message to bot:", error);
      }
    }
  }
  const { data, error, isLoading, isError, isSuccess, writeAsync } =
    useContractWrite({
      abi: AutoPayABI,
      address: `0x${Addresses.AutoPay}`,
      functionName: "createSubscription",
      onSuccess: (data) => {
        console.log(data);

        alert(`Successfully created Hash: ${data.hash}`);
        triggerBot();
      },
    });
    const {  writeAsync: ApproveToken} =
    useContractWrite({
      abi: TokenABI,
      address: tokenAddress,
      functionName: "approve",
    });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      Payee: "",
      token: "",
      subscription_cost : "",
      frequency: "Daily",
      subscription_period: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    if (!isConnected) {
      alert("Please connect your wallet.");
    }
    if(!currentMerchant){
      alert("No merchant selected")
      return;
    }

    const subscription_cost = BigInt(currentMerchant?.price_amount_usd * 10 ** 18);
    const frequency = values.frequency == "Daily" ? 0 : values.frequency == "Weekly" ? 1 : 2

    await ApproveToken({
      args : [`0x${Addresses.AutoPay}`, subscription_cost * BigInt(20)]
    })

    await writeAsync({
      args: [currentMerchant.address, subscription_cost, tokenAddress, currentMerchant.name,  currentMerchant.description, parseInt(values.subscription_period), frequency],
    });

    setTimeout(() => {
      form.reset();
    }, 2000);
  }

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const response = await fetch('API_KEY');
        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        setMerchants(jsonData.products);
      } catch (error) {
        alert(error);
      }
    };

    fetchData();
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">

        <FormField
            control={form.control}
            name="merchant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Merchant</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if(merchants){
                      for (let i = 0; i < merchants.length; i++) {
                        if (merchants[i].product_id === value) {
                          setCurrentMerchant(merchants[i]);
                          break;
                        }
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your Merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants && merchants.map((merchant)=>(
                      <SelectItem value={merchant.product_id}>{merchant.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            currentMerchant && 
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="ex- Music Subscription from merchant" value={currentMerchant.description} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> 
          }

          {
            currentMerchant &&       <FormField
            control={form.control}
            name="Payee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payee</FormLabel>
                <FormControl>
                  <Input readOnly value={currentMerchant.address} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          }

          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token</FormLabel>
                <FormControl>
                  <Input placeholder="ex-0x342t24...." value='USDT (sepolia)' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {currentMerchant && 

          <FormField
            control={form.control}
            name="subscription_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Cost</FormLabel>
                <FormControl>
                  <Input placeholder="ex- 100000000" value={currentMerchant.price_amount_usd + 'USDT'}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            }

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select
                  onValueChange={(value) => {
                    console.log(value);
                  }}
                  defaultValue={"Daily"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subscription_period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Period</FormLabel>
                <FormControl>
                  <Input placeholder="ex- 1" type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <Button type="submit">Create Subscription</Button>
      </form>
    </Form>
  );
};

export default SubscriptionForm
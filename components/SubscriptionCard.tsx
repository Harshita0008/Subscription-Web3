import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from './ui/button'
import { useContractWrite, useAccount, useNetwork } from "wagmi";
import AutoPayABI from "../constants/ABI/AutoPay.json";
import { CalendarCheck2 } from 'lucide-react';
import Addresses from "../constants/Addresses/Address.json";
import ChatIDAddress from "../UserIDToAddress.json"

  
const SubscriptionCard = (data : any) => {
  const { address, isConnected } = useAccount();
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
          text: `${address} has canceled Subscription`,
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
  const { write : CancelSubscriptioin } =
  useContractWrite({
    abi: AutoPayABI,
    address: `0x${Addresses.AutoPay}`,
    functionName: "cancelSubscription",
    onSuccess: (data) => {
      console.log(data);

      alert(`Successfully created Hash: ${data.hash}`);
      triggerBot();
    },
  });
  console.log(data)

  const Subscription_period = ['Daily', 'Weekly', 'Monthly']
  return (
    <div>
      {data.cardData?.isActive ? 
          <Card className={'m-2 p-2'}>
      <CardContent className="p-2 flex justify-between">
        <div className=''>
          <h1 className='text-xl font-semibold'>{data.cardData.name}</h1>
          <p className=' text-sm text-gray-600'>{data.cardData.description}</p>
        </div>
        <div className=''>
          <h1 className='text-xl font-semibold'>Token Address</h1>
          <p className=' text-sm text-gray-600'>{data.cardData.tokenAddress}</p>
        </div>
        <div className=''>
          <h1 className='text-xl font-semibold'>Allowance</h1>
          <p className=' text-sm text-gray-600 text-center'>{parseInt(data.cardData.allowance)/ 10 ** 18}$</p>
        </div>
        <div className=''>
          <h1 className='text-xl font-semibold'>Period</h1>
          <p className=' text-sm text-gray-600 text-center'>{Subscription_period[parseInt(data.cardData.subscriptionPeriod)]}</p>
        </div>
       
        <p><span className='font-bold'></span></p>
        <div>
          <Button variant={'destructive'} onClick={()=> CancelSubscriptioin({
            args : [data.cardData.customer, data.cardData.payee]
          })}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
     :  <h3>No Active Subscription</h3>
  }
    </div>
  )
}

export default SubscriptionCard
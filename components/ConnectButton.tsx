/* eslint no-use-before-define: 0 */  // --> OFF
/* eslint-disable padded-blocks */
"use client";

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { config } from "@/config";
import { useEffect } from "react";
import ChatIDAddress from "../UserIDToAddress.json";

export default function ConnectButton() {
  const { chain } = useNetwork();
  const { isConnected, address} = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const defaultChain = config.chains[0];

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
          text: `${address} is connected to AutoPay`,
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

  useEffect(() => {
    console.log(chain);

    if (isConnected) {
      console.log("clicked");
      triggerBot();
    }
    if (isConnected && chain?.id !== defaultChain.id) {
      switchNetwork?.(defaultChain.id);
    }
  }, [isConnected]);

  return (
    <span className="bg-black rounded-3xl">
      <w3m-button loadingLabel="loading..." label="Connect Wallet" />
    </span>
  );
}

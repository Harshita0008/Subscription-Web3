"use client";
import React, { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ConnectButton from "./ConnectButton";

const Navbar = () => {
  return (
    <nav className="bg-white sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-white">
        <div className="border-b border-gray-200 md:px-5 pr-2 flex items-center gap-5 justify-between">
          <div className="flex h-16 items-center cursor-pointer text-2xl font-bold">
            {/* TODO : Mobile nav */}
            <Link className= "flex items-center md:ml-10" href="/">MugglePay</Link>
          </div>
          <ConnectButton/>
        </div>
      </header>
    </nav>
  );
};

export default Navbar;

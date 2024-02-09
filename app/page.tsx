import { BellRing, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import SubscriptionForm from "@/components/SubscriptionForm"
import SubscriptionList from "@/components/SubscriptionList"


export default function Home() {
  return (
    <>
    <Card className={'m-10 p-10 max-md:my-10 max-md:mx-3 max-md:py-6 max-md:px-4 '}>
      <CardHeader>
        <CardTitle>Subscription List</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SubscriptionList/>
      </CardContent>
      <CardFooter className="flex justify-between">
      </CardFooter>
    </Card>
    <Card className={'m-10 p-10 max-md:my-10 max-md:mx-3 max-md:py-6 max-md:px-4 '}>
      <CardHeader>
        <CardTitle>Create Subscription</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
            <SubscriptionForm/>
      </CardContent>
      <CardFooter className="flex justify-between">
      </CardFooter>
    </Card>

    </>
  )
}

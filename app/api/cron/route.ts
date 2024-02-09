import {ethers} from "ethers";
import Addresses  from "../../../constants/Addresses/Address.json"
import ContractAbi from "../../../constants/ABI/AutoPay.json"

// Initialize an Ethereum provider (e.g., using Infura)
const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/UtuhstmhrhhnMARzFkLfn1OHwsWxC0PP');

// Wallet private key
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY ?? "";

// Connect wallet to provider
const wallet = new ethers.Wallet(privateKey, provider);

// Connect to the contract using the wallet
const contract = new ethers.Contract(`0x${Addresses.AutoPay}`, ContractAbi, wallet);

const GRAPHQL_ENDPOINT = "https://api.studio.thegraph.com/query/64394/autopay/v0.0.1";

interface Subscription {
  customer: string;
  payee: string;
}

export async function GET() {
  const transactionList:any[] = []
 
  try {
   const customerPayee = await getCustomerPayee();
   customerPayee.forEach(async (customerPayee) => {
    const tx = await contract.executePayment(customerPayee.customer, customerPayee.payee)
    transactionList.push(tx)
   });
   console.log(transactionList)
   
  } catch (error) {
    console.error('Error:', error);
  }
    return Response.json({ 'data' : transactionList});
  }


  async function getCustomerPayee(){
    const query = `query
   {
     newSubscriptions(first: 10) {
       customer
       payee
      }
    }`

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const uniquePairs: Set<string> = new Set();

    // Filter out duplicate customer-payee pairs
    const filteredSubscriptions: Subscription[] = data.data.newSubscriptions.filter((subscription: Subscription) => {
      const pair: string = `${subscription.customer}-${subscription.payee}`;
      if (uniquePairs.has(pair)) {
        // If pair is already encountered, return false to filter it out
        return false;
      } else {
        // Otherwise, add the pair to the set and return true to keep it
        uniquePairs.add(pair);
        return true;
      }
    });
    
    return filteredSubscriptions ?? [];
  }
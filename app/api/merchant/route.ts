export async function GET() {
  return Response.json({
    status: 200,
    products: [
      {
        product_id: "12920",
        user_id: "48443257-84ec-498f-b5b1-541082858651",
        price_amount_usd: 0.9,
        title: "Music Pay by Day",
        description:
          "Get unlimited access to our music and sound effects catalog for your videos, streams and podcasts. Our license comes with all necessary rights included.",
        name: "required",
        email: "required",
        phone: "optional",
        address: "0xab47828c07eeea1ecff55baa729da0eb3790f6fb",
      },
      {
        product_id: "23923",
        user_id: "48443257-84ec-498f-b5b1-541082858651",
        price_amount_usd: 9.9,
        title: "Music Pay by Month",
        description:
          "Get unlimited access to our music and sound effects catalog for your videos, streams and podcasts. Our license comes with all necessary rights included.",
        name: "required",
        email: "required",
        phone: "optional",
        address: "0xab47828c07eeea1ecff55baa729da0eb3790f6fb",
      },
      {
        product_id: "32411",
        user_id: "48443257-84ec-498f-b5b1-541082858651",
        price_amount_usd: 99.9,
        title: "Music Pay by Year",
        description:
          "Get unlimited access to our music and sound effects catalog for your videos, streams and podcasts. Our license comes with all necessary rights included.",
        name: "required",
        email: "required",
        phone: "optional",
        address: "0xab47828c07eeea1ecff55baa729da0eb3790f6fb",
      },
    ],
  });
}

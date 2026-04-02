export default async function seedProducts({ container }) {
  const productService = container.resolve("productService");

  const products = [
    {
      title: "Complete Visa Application Guide",
      description:
        "A comprehensive step-by-step guide covering visa applications for over 20 countries.",
      status: "published",
      metadata: {
        type: "digital",
        badge: {
          text: "BESTSELLER",
          color: "bg-secondary text-secondary-foreground",
        },
        saleRibbon: "HOT SALE 50% OFF",
        rating: 4.8,
      },
      variants: [
        {
          title: "Default",
          prices: [{ amount: 1999, currency_code: "usd" }],
        },
      ],
    },
    {
      title: "SOP Writing Masterclass",
      description:
        "Master the art of writing compelling Statements of Purpose.",
      status: "published",
      metadata: {
        type: "digital",
        badge: {
          text: "-50%",
          color: "bg-destructive text-destructive-foreground",
        },
        rating: 4.9,
      },
      variants: [
        {
          title: "Default",
          prices: [{ amount: 2999, currency_code: "usd" }],
        },
      ],
    },
  ];

  for (const product of products) {
    await productService.create(product);
  }

  console.log("✅ Products seeded successfully!");
}

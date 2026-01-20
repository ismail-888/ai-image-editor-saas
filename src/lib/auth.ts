// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../../generated/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { db } from "~/server/db";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "88adfc19-e9ac-4e2e-9e06-5afb658d2499",
              slug: "small",
            },
            {
              productId: "cf67ad86-f08c-42e4-89e4-71335287e37f",
              slug: "medium",
            },
            {
              productId: "328f6831-ceda-49cc-887f-55e61143404f",
              slug: "large",
            },
          ],
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (order) => {
            const externalCustomerId = order.data.customer.externalId;

            if (!externalCustomerId) {
              console.error("No external customer ID found in order:", order.data.id);
              throw new Error("No external customer id found.");
            }

            const productId = order.data.productId ?? order.data.product?.id;

            if (!productId) {
              console.error("No product ID found in order:", order.data.id);
              throw new Error("No product id found in order data.");
            }

            let creditsToAdd = 0;

            switch (productId) {
              case "88adfc19-e9ac-4e2e-9e06-5afb658d2499":
                creditsToAdd = 50;
                break;
              case "cf67ad86-f08c-42e4-89e4-71335287e37f":
                creditsToAdd = 200;
                break;
              case "328f6831-ceda-49cc-887f-55e61143404f":
                creditsToAdd = 400;
                break;
              default:
                console.warn("Unknown product ID:", productId, "for order:", order.data.id);
            }

            if (creditsToAdd > 0) {
              await db.user.update({
                where: { id: externalCustomerId },
                data: {
                  credits: {
                    increment: creditsToAdd,
                  },
                },
              });
            } else {
              console.error("No credits to add for product:", productId, "order:", order.data.id);
            }
          },
        }),
      ],
    }),
  ],
});
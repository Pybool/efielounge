import express from "express";
import { decode, ensureAdmin } from "../../middlewares/jwt";
import transactionController from "../../controllers/v1/transaction.controller";
import { CartService } from "../../services/v1/orders/cart.service";
import mailActions from "../../services/v1/Mail/mail.service";
const authMiddleware = decode;
const transactionRouter = express.Router();

function formatDate(isoString: string) {
  const date = new Date(isoString);
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

transactionRouter.post(
  "/save-transaction",
  authMiddleware,
  transactionController.saveTransaction
);

transactionRouter.get(
  "/paystack/verify-transaction",
  authMiddleware,
  transactionController.verifyTransaction
);

transactionRouter.get(
  "/fetch-transactions",
  authMiddleware,
  ensureAdmin,
  transactionController.fetchTransactions
);

const result = {
  metaData: {
    date: formatDate("2024-08-16T23:06:32.997Z"),
    orderId: "EF-0002444",
    name: "Eko Emmanuel",
    deliveryAddress: {
      _id: "66bd99a8478af8af1695cd5f",
      account: "66bd0aab7ee98779c95d7dd3",
      address: "Jeep street w811",
      district: "Ashaiman Municipal",
      phone: null,
      isDefault: true,
      __v: 0,
    },
    amountPaid: 22500,
    paymentChannel: "mobile_money".replaceAll("_", " "),
    currency: "GHS",
    status: "success",
    email: "admin@gmail.com",
  },
  polulatedOrders: [
    {
      account: "66bd0aab7ee98779c95d7dd3",
      checkOutId: "EF-0002466",
      menu: {
        _id: "6674223e763a24d91e695465",
        name: "Peking Duck (Běijīng Kǎoyā)",
        description:
          "“Crispy roasted duck sliced into bite-sized pieces, rolled up in a wrapper with salad and hoisin sauce.”",
        slug: "peking-duck-b-ij-ng-k-oy",
        price: 35.99,
        currency: "GHC",
        attachments: [
          "//public/menu-attachments/20-06-2024/89875bbb-2d87-43f9-9bf8-2d7ced412fd8-traditional-chinese-food-peking-duck.webp",
        ],
        menuItems: ["66722ac817419bfd43926104"],
        category: "66721881d56a3ceca28483b6",
        ratings: 0,
        likes: 0,
        status: "Ready",
        __v: 1,
        archive: false,
        iRated: false,
        inCart: false,
        variants: [
          {
            name: "Bitter",
            price: "30.90",
          },
          {
            name: "Sweet",
            price: "35.90",
          },
        ],
      },
      units: 2,
      total: 143.78,
      variants: ["Sweet"],
      customMenuItems: [],
      createdAt: "2024-08-17T00:03:06.113Z",
      status: "PENDING",
      _id: "66bfe8baf182837bf24af2a3",
      __v: 0,
    },
    {
      account: "66bd0aab7ee98779c95d7dd3",
      checkOutId: "EF-0002466",
      menu: {
        _id: "66a98a0f3ac5c316ecc58b0c",
        name: "Yam and Egg",
        description: "",
        slug: "yam-and-egg",
        price: 40,
        currency: "GH₵",
        variants: [],
        attachments: [
          "/public/menu-attachments/31-07-2024/7b5074c8-c0e3-4580-8ae6-81cc94879a70-yam-egg.png",
        ],
        menuItems: ["66722ac817419bfd43926104", "669ffe8557e6ed27db696f0d"],
        category: "66797bf85fa02585f3ce3e89",
        ratings: 0,
        likes: 0,
        iRated: false,
        inCart: false,
        createdAt: "2024-07-31T00:49:19.540Z",
        status: "Cooking",
        archive: false,
        __v: 0,
      },
      units: 1,
      total: 45.99,
      variants: [],
      customMenuItems: [
        {
          _id: "66722ac817419bfd43926104",
          name: "Coca Cola",
          category: "6672295e05611e4d8ae47fa2",
          description: "Its just a coke",
          price: 5.99,
          attachments: [
            "..\\efielounge-backend\\public\\menu-attachments\\19-06-2024\\93cd2d1a-872e-4b22-8c9d-0874ab7ca479-coke.jpeg",
          ],
          currency: "USD",
          status: "Available",
          __v: 0,
          archive: false,
        },
      ],
      createdAt: "2024-08-17T00:03:06.122Z",
      status: "PENDING",
      _id: "66bfe8baf182837bf24af2a5",
      __v: 0,
    },
    {
      account: "66bd0aab7ee98779c95d7dd3",
      checkOutId: "EF-0002466",
      menu: {
        _id: "6674223e763a24d91e695465",
        name: "Peking Duck (Běijīng Kǎoyā)",
        description:
          "“Crispy roasted duck sliced into bite-sized pieces, rolled up in a wrapper with salad and hoisin sauce.”",
        slug: "peking-duck-b-ij-ng-k-oy",
        price: 35.99,
        currency: "GHC",
        attachments: [
          "//public/menu-attachments/20-06-2024/89875bbb-2d87-43f9-9bf8-2d7ced412fd8-traditional-chinese-food-peking-duck.webp",
        ],
        menuItems: ["66722ac817419bfd43926104"],
        category: "66721881d56a3ceca28483b6",
        ratings: 0,
        likes: 0,
        status: "Ready",
        __v: 1,
        archive: false,
        iRated: false,
        inCart: false,
        variants: [
          {
            name: "Bitter",
            price: "30.90",
          },
          {
            name: "Sweet",
            price: "35.90",
          },
        ],
      },
      units: 2,
      total: 143.78,
      variants: ["Sweet"],
      customMenuItems: [],
      createdAt: "2024-08-17T00:03:06.113Z",
      status: "PENDING",
      _id: "66bfe8baf182837bf24af2a3",
      __v: 0,
    },
    {
      account: "66bd0aab7ee98779c95d7dd3",
      checkOutId: "EF-0002466",
      menu: {
        _id: "66a98a0f3ac5c316ecc58b0c",
        name: "Yam and Egg",
        description: "",
        slug: "yam-and-egg",
        price: 40,
        currency: "GH₵",
        variants: [],
        attachments: [
          "/public/menu-attachments/31-07-2024/7b5074c8-c0e3-4580-8ae6-81cc94879a70-yam-egg.png",
        ],
        menuItems: ["66722ac817419bfd43926104", "669ffe8557e6ed27db696f0d"],
        category: "66797bf85fa02585f3ce3e89",
        ratings: 0,
        likes: 0,
        iRated: false,
        inCart: false,
        createdAt: "2024-07-31T00:49:19.540Z",
        status: "Cooking",
        archive: false,
        __v: 0,
      },
      units: 1,
      total: 45.99,
      variants: [],
      customMenuItems: [
        {
          _id: "66722ac817419bfd43926104",
          name: "Coca Cola",
          category: "6672295e05611e4d8ae47fa2",
          description: "Its just a coke",
          price: 5.99,
          attachments: [
            "..\\efielounge-backend\\public\\menu-attachments\\19-06-2024\\93cd2d1a-872e-4b22-8c9d-0874ab7ca479-coke.jpeg",
          ],
          currency: "USD",
          status: "Available",
          __v: 0,
          archive: false,
        },
      ],
      createdAt: "2024-08-17T00:03:06.122Z",
      status: "PENDING",
      _id: "66bfe8baf182837bf24af2a5",
      __v: 0,
    },
    {
      account: "66bd0aab7ee98779c95d7dd3",
      checkOutId: "EF-0002466",
      menu: {
        _id: "6674223e763a24d91e695465",
        name: "Peking Duck (Běijīng Kǎoyā)",
        description:
          "“Crispy roasted duck sliced into bite-sized pieces, rolled up in a wrapper with salad and hoisin sauce.”",
        slug: "peking-duck-b-ij-ng-k-oy",
        price: 35.99,
        currency: "GHC",
        attachments: [
          "//public/menu-attachments/20-06-2024/89875bbb-2d87-43f9-9bf8-2d7ced412fd8-traditional-chinese-food-peking-duck.webp",
        ],
        menuItems: ["66722ac817419bfd43926104"],
        category: "66721881d56a3ceca28483b6",
        ratings: 0,
        likes: 0,
        status: "Ready",
        __v: 1,
        archive: false,
        iRated: false,
        inCart: false,
        variants: [
          {
            name: "Bitter",
            price: "30.90",
          },
          {
            name: "Sweet",
            price: "35.90",
          },
        ],
      },
      units: 2,
      total: 143.78,
      variants: ["Sweet"],
      customMenuItems: [],
      createdAt: "2024-08-17T00:03:06.113Z",
      status: "PENDING",
      _id: "66bfe8baf182837bf24af2a3",
      __v: 0,
    },
    {
      account: "66bd0aab7ee98779c95d7dd3",
      checkOutId: "EF-0002466",
      menu: {
        _id: "66a98a0f3ac5c316ecc58b0c",
        name: "Yam and Egg",
        description: "",
        slug: "yam-and-egg",
        price: 40,
        currency: "GH₵",
        variants: [],
        attachments: [
          "/public/menu-attachments/31-07-2024/7b5074c8-c0e3-4580-8ae6-81cc94879a70-yam-egg.png",
        ],
        menuItems: ["66722ac817419bfd43926104", "669ffe8557e6ed27db696f0d"],
        category: "66797bf85fa02585f3ce3e89",
        ratings: 0,
        likes: 0,
        iRated: false,
        inCart: false,
        createdAt: "2024-07-31T00:49:19.540Z",
        status: "Cooking",
        archive: false,
        __v: 0,
      },
      units: 1,
      total: 45.99,
      variants: [],
      customMenuItems: [
        {
          _id: "66722ac817419bfd43926104",
          name: "Coca Cola",
          category: "6672295e05611e4d8ae47fa2",
          description: "Its just a coke",
          price: 5.99,
          attachments: [
            "..\\efielounge-backend\\public\\menu-attachments\\19-06-2024\\93cd2d1a-872e-4b22-8c9d-0874ab7ca479-coke.jpeg",
          ],
          currency: "USD",
          status: "Available",
          __v: 0,
          archive: false,
        },
      ],
      createdAt: "2024-08-17T00:03:06.122Z",
      status: "PENDING",
      _id: "66bfe8baf182837bf24af2a5",
      __v: 0,
    },
  ],
};

transactionRouter.get(
  "/test-receipt",
  // authMiddleware,
  async (req: any, res: any) => {
    mailActions.orders.sendReceiptMail(
      result.metaData?.email,
      result.metaData,
      result.polulatedOrders
    );
    res.send("Sent receipt");
  }
);

export default transactionRouter;

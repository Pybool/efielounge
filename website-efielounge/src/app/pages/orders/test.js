const orders = [
    {
        "_id": "667e5c1e842d0df04c82af3b",
        "account": "666edcf26b40954776d2f9d2",
        "checkOutId": "EF-0000300",
        "menu": {
            "inCart": false,
            "_id": "667423a3763a24d91e695494",
            "name": "Char Siu (Chāsīu)",
            "description": "Technically, char siu is a way to flavor and cook barbecued meat (specifically pork). Its name literally means “fork roasted,” since the Cantonese dish is cooked on a skewer in an oven or over a fire.",
            "slug": "char-siu-ch-s-u",
            "price": 22.45,
            "currency": "GHC",
            "attachments": [
                "//public/menu-attachments/20-06-2024/de19b82a-8a8a-4629-8fc6-6786c2109091-traditional-chinese-food-char-siu.webp"
            ],
            "menuItems": [
                "66722ac817419bfd43926104",
                "66722c002cf7ea8eb86321ac"
            ],
            "category": "66721881d56a3ceca28483b6",
            "ratings": 0,
            "likes": 0,
            "status": "Cooking",
            "__v": 0
        },
        "units": 1,
        "customMenuItems": [],
        "grandTotal": 0,
        "createdAt": "2024-06-28T06:45:50.336Z",
        "status": "PENDING",
        "__v": 0
    },
    {
        "_id": "667e5c1e842d0df04c82af39",
        "account": "666edcf26b40954776d2f9d2",
        "checkOutId": "EF-0000300",
        "menu": {
            "inCart": false,
            "_id": "6674233a763a24d91e69548c",
            "name": "Kung Pao Chicken",
            "description": "“This is probably the most well-known Chinese chicken dish outside of China,” Yinn Low says. “It’s also an authentic and traditional dish that you can find in many restaurants in China.”",
            "slug": "kung-pao-chicken-gong-bao-ji-ding",
            "price": 45.99,
            "currency": "GHC",
            "attachments": [
                "//public/menu-attachments/20-06-2024/94293809-e788-4bad-9b0d-5e402d3ab21b-traditional-chinese-food-kung-pao-chicken.webp"
            ],
            "menuItems": [
                "66722ac817419bfd43926104",
                "66722c002cf7ea8eb86321ac"
            ],
            "category": "66721881d56a3ceca28483b6",
            "ratings": 0,
            "likes": 0,
            "status": "Cooking",
            "__v": 0
        },
        "units": 3,
        "customMenuItems": [],
        "grandTotal": 0,
        "createdAt": "2024-06-28T06:45:50.332Z",
        "status": "PENDING",
        "__v": 0
    },
    {
        "_id": "667e5c1e842d0df04c82af37",
        "account": "666edcf26b40954776d2f9d2",
        "checkOutId": "EF-0000300",
        "menu": {
            "inCart": false,
            "_id": "6674223e763a24d91e695465",
            "name": "Peking Duck (Běijīng Kǎoyā)",
            "description": "“Crispy roasted duck sliced into bite-sized pieces, rolled up in a wrapper with salad and hoisin sauce.”",
            "slug": "peking-duck-b-ij-ng-k-oy",
            "price": 45.99,
            "currency": "GHC",
            "attachments": [
                "//public/menu-attachments/20-06-2024/89875bbb-2d87-43f9-9bf8-2d7ced412fd8-traditional-chinese-food-peking-duck.webp"
            ],
            "menuItems": [
                "66722ac817419bfd43926104",
                "66722c002cf7ea8eb86321ac"
            ],
            "category": "66721881d56a3ceca28483b6",
            "ratings": 0,
            "likes": 0,
            "status": "Cooking",
            "__v": 0
        },
        "units": 2,
        "customMenuItems": [],
        "grandTotal": 0,
        "createdAt": "2024-06-28T06:45:50.327Z",
        "status": "PENDING",
        "__v": 0
    },
    {
        "_id": "667e5c1e842d0df04c82af35",
        "account": "666edcf26b40954776d2f9d2",
        "checkOutId": "EF-0000300",
        "menu": {
            "inCart": false,
            "_id": "66741f1e763a24d91e69544c",
            "name": "Fried Rice (Chǎofàn)",
            "description": "“Chinese fried rice is a complete meal that feeds the entire family. The combination of ingredients can be anything from protein (chicken, pork, shrimp) to vegetables (carrots, peas, onions). It’s a wholesome meal for dinner.” ",
            "slug": "fried-rice-ch-of-n",
            "price": 25.56,
            "currency": "GHC",
            "attachments": [
                "//public/menu-attachments/20-06-2024/3f0d528f-fb5f-40a8-9463-b6c1edae0955-traditional-chinese-food-fried-rice.webp"
            ],
            "menuItems": [
                "66722ac817419bfd43926104",
                "66722c002cf7ea8eb86321ac"
            ],
            "category": "66721881d56a3ceca28483b6",
            "ratings": 0,
            "likes": 0,
            "status": "Ready",
            "__v": 0
        },
        "units": 1,
        "customMenuItems": [],
        "grandTotal": 0,
        "createdAt": "2024-06-28T06:45:50.298Z",
        "status": "PENDING",
        "__v": 0
    }
]

  
  const groupedOrders = orders.reduce((acc, order) => {
    const checkOutId = order.checkOutId;
    acc[checkOutId] = acc[checkOutId] || []; // Initialize array if not existing
    acc[checkOutId].push(order);
    return acc;
  }, {});
  
  const formattedResult = Object.entries(groupedOrders).map(([checkOutId, orders]) => ({
    checkOutId,
    orders,
  }));
  
  console.log(formattedResult);
  
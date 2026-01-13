/**
 * Seed Firestore: categories + products
 * Requisitos:
 * 1) Tener un service account JSON (Firebase Admin SDK)
 * 2) Exportar GOOGLE_APPLICATION_CREDENTIALS=/ruta/serviceAccount.json
 * 3) node tools/seed_firestore.js
 */

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function upsertById(col, id, data) {
  await db.collection(col).doc(id).set(data, { merge: true });
}

async function run() {
  // CATEGORIES
  const categories = [
    { id: "cat_burgers", name: "Hamburguesas", icon: "🍔", sortOrder: 1 },
    { id: "cat_chicken", name: "Pollo", icon: "🍗", sortOrder: 2 },
    { id: "cat_fries", name: "Papas", icon: "🍟", sortOrder: 3 },
    { id: "cat_drinks", name: "Bebidas", icon: "🥤", sortOrder: 4 },
    { id: "cat_desserts", name: "Postres", icon: "🍦", sortOrder: 5 },
    { id: "cat_promos", name: "Promos", icon: "🔥", sortOrder: 6 },
  ];

  for (const c of categories) {
    await upsertById("catalog_categories", c.id, {
      name: c.name,
      icon: c.icon,
      sortOrder: c.sortOrder,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // PRODUCTS
  const products = [
    {
      id: "p_big_burger",
      name: "Combo Big Burger",
      description: "Hamburguesa doble + papas + bebida",
      basePrice: 6.99,
      imagenUrl:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
      isAvailable: true,
      tags: ["burger", "combo", "popular"],
      categoryId: "cat_burgers",
    },
    {
      id: "p_classic_burger",
      name: "Classic Burger",
      description: "Hamburguesa clásica con queso",
      basePrice: 4.49,
      imagenUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      isAvailable: true,
      tags: ["burger"],
      categoryId: "cat_burgers",
    },
    {
      id: "p_chicken_combo",
      name: "Combo Chicken",
      description: "Pollo crispy + papas + bebida",
      basePrice: 7.49,
      imagenUrl:
        "https://images.unsplash.com/photo-1604908554162-45f4bc5b3b45?w=800",
      isAvailable: true,
      tags: ["chicken", "combo"],
      categoryId: "cat_chicken",
    },
    {
      id: "p_fries_large",
      name: "Papas Grandes",
      description: "Papas fritas tamaño grande",
      basePrice: 2.25,
      imagenUrl:
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800",
      isAvailable: true,
      tags: ["fries"],
      categoryId: "cat_fries",
    },
    {
      id: "p_cola",
      name: "Cola",
      description: "Bebida gaseosa 500ml",
      basePrice: 1.50,
      imagenUrl:
        "https://images.unsplash.com/photo-1622482183736-60d6b10b1e56?w=800",
      isAvailable: true,
      tags: ["drink"],
      categoryId: "cat_drinks",
    },
    {
      id: "p_icecream",
      name: "Helado Vainilla",
      description: "Helado suave sabor vainilla",
      basePrice: 1.99,
      imagenUrl:
        "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800",
      isAvailable: true,
      tags: ["dessert"],
      categoryId: "cat_desserts",
    },
  ];

  for (const p of products) {
    await upsertById("catalog_products", p.id, {
      name: p.name,
      description: p.description,
      basePrice: p.basePrice,
      imagenUrl: p.imagenUrl,
      isAvailable: p.isAvailable,
      tags: p.tags,
      categoryId: p.categoryId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log("Seed completado: categories + products");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

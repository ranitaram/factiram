import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTOS = [
  { nombre: "Carne de res", unidad: "kg", categoria: "Carnes" },
  { nombre: "Pollo", unidad: "kg", categoria: "Carnes" },
  { nombre: "Cerdo", unidad: "kg", categoria: "Carnes" },
  { nombre: "Chorizo", unidad: "kg", categoria: "Carnes" },
  { nombre: "Camaron", unidad: "kg", categoria: "Mariscos" },
  { nombre: "Pescado molido", unidad: "kg", categoria: "Mariscos" },
  { nombre: "Tomate", unidad: "kg", categoria: "Verduras" },
  { nombre: "Cebolla", unidad: "kg", categoria: "Verduras" },
  { nombre: "Limon", unidad: "kg", categoria: "Verduras" },
  { nombre: "Chile", unidad: "kg", categoria: "Verduras" },
  { nombre: "Papa", unidad: "kg", categoria: "Verduras" },
  { nombre: "Zanahoria", unidad: "kg", categoria: "Verduras" },
  { nombre: "Ajo", unidad: "pieza", categoria: "Verduras" },
  { nombre: "Aguacate", unidad: "kg", categoria: "Frutas" },
  { nombre: "Platano", unidad: "kg", categoria: "Frutas" },
  { nombre: "Manzana", unidad: "kg", categoria: "Frutas" },
  { nombre: "Leche", unidad: "litro", categoria: "Lacteos" },
  { nombre: "Queso", unidad: "kg", categoria: "Lacteos" },
  { nombre: "Crema", unidad: "litro", categoria: "Lacteos" },
  { nombre: "Mantequilla", unidad: "kg", categoria: "Lacteos" },
  { nombre: "Arroz", unidad: "kg", categoria: "Basicos" },
  { nombre: "Frijol", unidad: "kg", categoria: "Basicos" },
  { nombre: "Aceite", unidad: "litro", categoria: "Basicos" },
  { nombre: "Sal", unidad: "kg", categoria: "Basicos" },
  { nombre: "Azucar", unidad: "kg", categoria: "Basicos" },
  { nombre: "Harina", unidad: "kg", categoria: "Basicos" },
  { nombre: "Refresco", unidad: "litro", categoria: "Bebidas" },
  { nombre: "Agua", unidad: "litro", categoria: "Bebidas" },
  { nombre: "Jugo", unidad: "litro", categoria: "Bebidas" },
  { nombre: "Tortilla de maiz", unidad: "kg", categoria: "Tortilleria" },
  { nombre: "Pan blanco", unidad: "pieza", categoria: "Tortilleria" },
  { nombre: "Huevo", unidad: "docena", categoria: "Varios" },
  { nombre: "Papel de cocina", unidad: "pieza", categoria: "Varios" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(text: string): Promise<string> {
  let slug = slugify(text);
  let counter = 1;
  while (await prisma.abastosProducto.findUnique({ where: { slug } })) {
    slug = `${slugify(text)}-${counter}`;
    counter++;
  }
  return slug;
}

async function main() {
  console.log("🌱 Sembrando Abastos...");

  const proveedor = await prisma.abastosProveedor.upsert({
    where: { nombre: "Soriana Cigarrera" },
    update: {},
    create: {
      nombre: "Soriana Cigarrera",
    },
  });
  console.log(`  ✓ Proveedor: ${proveedor.nombre}`);

  for (const p of PRODUCTOS) {
    const slug = await uniqueSlug(p.nombre);
    await prisma.abastosProducto.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: {
        slug,
        nombre: p.nombre,
        unidad: p.unidad,
        categoria: p.categoria,
      },
    });
    console.log(`  ✓ Producto: ${p.nombre} → ${slug} (${p.unidad})`);
  }

  console.log("✅ Abastos listo. Los precios quedan vacios para que los llenes desde el admin.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

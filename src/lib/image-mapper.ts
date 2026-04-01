// A smart utility that returns a beautiful, consumer-friendly product image based on KPDN item names
// Ideal for moms and personal shoppers comparing items

export function getProductImage(itemName: string, groupOrCategory: string = ""): string {
  const name = itemName.toLowerCase();
  const cat = groupOrCategory.toLowerCase();

  // 1. Specific Branded / Packaged Goods
  if (name.includes("milo")) return "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&auto=format&fit=crop"; // Chocolate drink
  if (name.includes("nescafe") || name.includes("kopi")) return "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&auto=format&fit=crop"; 
  if (name.includes("maggi") || name.includes("noodle") || name.includes("mi segera")) return "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop"; // Noodles
  if (name.includes("dutch lady") || name.includes("susu segar") || name.includes("farm fresh")) return "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop"; // Milk carton
  if (name.includes("sardin") || name.includes("tuna") || name.includes("mackerel")) return "https://images.unsplash.com/photo-1593457193356-8e5dd04ebac9?w=500&auto=format&fit=crop"; // Canned fish
  if (name.includes("coca cola") || name.includes("pepsi") || name.includes("100 plus")) return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop"; // Cola/Soda
  
  // 2. Fresh Produce & Staples
  if (name.includes("ayam")) return "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500&auto=format&fit=crop"; // Raw chicken
  if (name.includes("telur")) return "https://images.unsplash.com/photo-1587486913049-53fd88e51111?w=500&auto=format&fit=crop"; // Quality farm eggs
  if (name.includes("daging") || name.includes("lembu") || name.includes("kambing")) return "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop"; // Fresh meat
  if (name.includes("ikan") && name.includes("bilis")) return "https://images.unsplash.com/photo-1627993047248-e87a224eb972?w=500&auto=format&fit=crop"; // Dried anchovies
  if (name.includes("ikan") || name.includes("siakap") || name.includes("kembung")) return "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&auto=format&fit=crop"; // Fresh market fish
  if (name.includes("udang")) return "https://images.unsplash.com/photo-1559742811-822873691fc2?w=500&auto=format&fit=crop"; // Fresh prawns
  if (name.includes("sotong")) return "https://images.unsplash.com/photo-1599086036127-1ac26fbc1c9b?w=500&auto=format&fit=crop"; // Fresh squid
  
  if (name.includes("beras") || name.includes("nasi")) return "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&auto=format&fit=crop"; // Premium rice
  if (name.includes("minyak masak") || name.includes("minyak jagung")) return "https://images.unsplash.com/photo-1474926256705-ebad11400bc4?w=500&auto=format&fit=crop"; // Cooking oil
  if (name.includes("gula")) return "https://images.unsplash.com/photo-1581454508930-cfb74efb4ce6?w=500&auto=format&fit=crop"; // Sugar
  if (name.includes("tepung")) return "https://images.unsplash.com/photo-1606757683939-5098ef7ce074?w=500&auto=format&fit=crop"; // Flour
  
  // Vegetables
  if (name.includes("bawang merah") || name.includes("bawang kecil")) return "https://images.unsplash.com/photo-1518977676367-e9a0f023f03b?w=500&auto=format&fit=crop"; // Red onions
  if (name.includes("bawang besar")) return "https://images.unsplash.com/photo-1618512496248-a07ce83aa8cb?w=500&auto=format&fit=crop"; // Yellow onions
  if (name.includes("bawang putih")) return "https://images.unsplash.com/photo-1540148426945-8ced01c12dfc?w=500&auto=format&fit=crop"; // Garlic
  if (name.includes("cili") || name.includes("lada")) return "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=500&auto=format&fit=crop"; // Chilies
  if (name.includes("tomato")) return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop"; // Tomatoes
  if (name.includes("kubis") || name.includes("cabbage")) return "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=500&auto=format&fit=crop"; // Cabbage
  if (name.includes("kentang")) return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop"; // Potatoes
  if (name.includes("carrot") || name.includes("lobak")) return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop"; // Carrots
  
  // Fruits
  if (name.includes("pisang")) return "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=500&auto=format&fit=crop"; 
  if (name.includes("tembikai") || name.includes("watermelon")) return "https://images.unsplash.com/photo-1587049352847-81a56d773c16?w=500&auto=format&fit=crop";
  if (name.includes("anggur")) return "https://images.unsplash.com/photo-1596368708356-6e1e1025ee72?w=500&auto=format&fit=crop";
  if (name.includes("epal") || name.includes("apple")) return "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&auto=format&fit=crop";
  
  // Diapers & Baby
  if (name.includes("diaper") || name.includes("lampin") || name.includes("drypers") || name.includes("petpet")) return "https://images.unsplash.com/photo-1512402927282-3d74c86e06b3?w=500&auto=format&fit=crop"; // Baby/diapers wrapper
  
  // Personal Care / Wash
  if (name.includes("sabun") || name.includes("shampoo") || name.includes("dynamo")) return "https://images.unsplash.com/photo-1584824486509-112e4181f193?w=500&auto=format&fit=crop"; // Cleaning supplies
  
  // Restaurant / Ready Food
  if (name.includes("nasi goreng")) return "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=500&auto=format&fit=crop";
  if (name.includes("mi goreng") || name.includes("kuey teow")) return "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500&auto=format&fit=crop";
  if (name.includes("roti canai")) return "https://images.unsplash.com/photo-1626082895617-2c6ad3663b65?w=500&auto=format&fit=crop";
  if (name.includes("ayam goreng")) return "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&auto=format&fit=crop";

  // 3. Category Fallbacks
  if (cat.includes("sayur")) return "https://images.unsplash.com/photo-1576082989182-d59ea27382d6?w=500&auto=format&fit=crop"; // General fresh veggies
  if (cat.includes("ikan") || cat.includes("laut")) return "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=500&auto=format&fit=crop"; // Raw fish market
  if (cat.includes("buah")) return "https://images.unsplash.com/photo-1610832958506-c563d76e33fd?w=500&auto=format&fit=crop"; // Mixed fruit assortment
  if (cat.includes("kering")) return "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop"; // Dry generic pantry

  // 4. Ultimate Fallback (Premium fresh grocery cart)
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop"; 
}

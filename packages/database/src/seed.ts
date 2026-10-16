import { db } from "./index";

const existing = await db.orm.public.User.select("id").all();
if (existing.length === 0) {
  await db.orm.public.User.create({ email: "alice@prisma.io", name: "Alice" });
  await db.orm.public.User.create({ email: "bob@prisma.io", name: "Bob" });
}
console.log(await db.orm.public.User.select("id", "email", "name").all());
await db.close();
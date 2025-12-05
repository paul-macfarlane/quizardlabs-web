import { db } from "@/lib/db/drizzle";
import { testTable } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tests = await db.select().from(testTable);

  return (
    <div>
      <h1>Tests</h1>

      <pre>{JSON.stringify(tests, null, 2)}</pre>
    </div>
  );
}

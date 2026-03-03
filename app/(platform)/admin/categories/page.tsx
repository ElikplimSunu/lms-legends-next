import { createServerClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = {
  title: "Categories | LMS Legends Admin",
};

export default async function AdminCategoriesPage() {
  const supabase = await createServerClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
      <CategoryManager categories={categories || []} />
    </div>
  );
}

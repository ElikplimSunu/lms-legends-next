import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const metadata = {
  title: "Course Catalog | LMS Legends",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; categoryId?: string }>;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { title, categoryId } = await searchParams;

  let query = supabase
    .from("courses")
    .select("*, categories(*), modules(id, lessons(id))")
    .eq("status", "published");

  if (title) {
    query = query.ilike("title", `%${title}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  query = query.order("created_at", { ascending: false });

  const { data: courses } = await query;
  
  // Get categories for filtering
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 space-y-6">
           <form className="relative">
             <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
             <Input 
               name="title"
               defaultValue={title}
               placeholder="Search for a course..."
               className="w-full pl-9 bg-white dark:bg-zinc-950" 
             />
             {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
             <button type="submit" className="hidden">Search</button>
           </form>

           <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                 <Link href={`/courses${title ? `?title=${title}` : ""}`}>
                    <div className={`text-sm px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${!categoryId ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10" : "text-zinc-600 dark:text-zinc-400"}`}>
                        All Categories
                    </div>
                 </Link>
                 {categories?.map((category) => (
                    <Link key={category.id} href={`/courses?categoryId=${category.id}${title ? `&title=${title}` : ""}`}>
                        <div className={`text-sm px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${categoryId === category.id ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10" : "text-zinc-600 dark:text-zinc-400"}`}>
                            {category.name}
                        </div>
                    </Link>
                 ))}
              </div>
           </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1">
            {!courses || courses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500">
                    No courses found. Try adjusting your search filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          progress={null} // TODO: Add student progress calculation
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

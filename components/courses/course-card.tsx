import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: any;
  progress: number | null;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  // Calculate total lessons
  const totalLessons = course.modules?.reduce((acc: number, module: any) => {
    return acc + (module.lessons?.length || 0);
  }, 0) || 0;

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="group hover:shadow-sm transition overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 h-full flex flex-col">
        <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {course.image_url ? (
            <Image
              fill
              className="object-cover"
              alt={course.title}
              src={course.image_url}
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-zinc-400">
                No Image
             </div>
          )}
        </div>
        
        <div className="flex flex-col flex-grow p-4">
          <div className="text-lg md:text-base font-semibold group-hover:text-blue-600 transition line-clamp-2">
            {course.title}
          </div>
          
          <p className="text-xs text-zinc-500 mb-3">{course.categories?.name}</p>
          
          <div className="flex items-center gap-x-2 text-sm md:text-xs text-zinc-500 mt-auto">
            <div className="flex items-center gap-x-1">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
              </span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
              {progress !== null ? (
                <div className="w-full">
                  {/* Progress bar placeholder */}
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs font-medium text-emerald-600 mt-1">{Math.round(progress)}% Complete</p>
                </div>
              ) : (
                <p className="text-md md:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {course.price === 0 || !course.price ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
                          Free
                      </Badge>
                  ) : (
                      `$${course.price.toFixed(2)}`
                  )}
                </p>
              )}
          </div>
        </div>
      </div>
    </Link>
  );
}

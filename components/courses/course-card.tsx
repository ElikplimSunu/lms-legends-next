import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: unknown;
  progress: number | null;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  // Calculate total lessons
  const totalLessons = course.modules?.reduce((acc: number, module: unknown) => {
    return acc + (module.lessons?.length || 0);
  }, 0) || 0;

  return (
    <Link href={`/courses/${course.slug || course.id}`}>
      <div className="group hover:shadow-sm transition overflow-hidden border border-border dark:border-border rounded-xl bg-card text-card-foreground h-full flex flex-col">
        <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-muted dark:bg-muted">
          {course.thumbnail_url ? (
            <Image
              fill
              className="object-cover"
              alt={course.title}
              src={course.thumbnail_url}
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
             </div>
          )}
        </div>
        
        <div className="flex flex-col flex-grow p-4">
          <div className="text-lg md:text-base font-semibold group-hover:text-primary transition line-clamp-2">
            {course.title}
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">{course.categories?.name}</p>
          
          <div className="flex items-center gap-x-2 text-sm md:text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-x-1">
              <BookOpen className="w-4 h-4 text-primary dark:text-primary/70" />
              <span>
                {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
              </span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
              {progress !== null ? (
                <div className="w-full">
                  {/* Progress bar placeholder */}
                  <div className="h-2 w-full bg-muted dark:bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs font-medium text-emerald-600 mt-1">{Math.round(progress)}% Complete</p>
                </div>
              ) : (
                <p className="text-md md:text-sm font-semibold text-foreground dark:text-zinc-200">
                  {course.price_cents === 0 || !course.price_cents ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">
                          Free
                      </Badge>
                  ) : (
                      `$${(course.price_cents / 100).toFixed(2)}`
                  )}
                </p>
              )}
          </div>
        </div>
      </div>
    </Link>
  );
}

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { enrollCourse } from "@/lib/actions/course";
import Link from "next/link"; // 引入 Link
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  coverImage?: string;
  teacher?: {
    name: string;
  };
}

export function CourseCard({
  course,
  isEnrolled,
}: {
  course: Course;
  isEnrolled: boolean;
}) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        {course.coverImage ? (
          <Image
            src={course.coverImage}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground">暂无封面</span>
        )}
      </div>
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <CardDescription>{course.teacher?.name || "未知"} 老师</CardDescription>
      </CardHeader>
      <CardFooter>
        {isEnrolled ? (
          // 修改点：已选课则变成“继续学习”按钮
          <Button variant="secondary" className="w-full" asChild>
            <Link href={`/dashboard/learn/${course.id}`}>进入学习</Link>
          </Button>
        ) : (
          <form
            action={async () => {
              "use server";
              await enrollCourse(course.id);
            }}
            className="w-full"
          >
            <Button className="w-full">立即加入</Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
}

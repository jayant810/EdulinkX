import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "EdulinkX has completely transformed how we manage our academic operations. The student engagement has increased by 40% since we implemented it.",
    author: "Dr. Sarah Johnson",
    role: "Dean of Academics",
    institution: "Stanford Technical College",
    avatar: "SJ",
    rating: 5,
  },
  {
    quote: "The attendance tracking and grade management features have saved our faculty countless hours. It's intuitive and powerful.",
    author: "Prof. Michael Chen",
    role: "Department Head",
    institution: "MIT Engineering",
    avatar: "MC",
    rating: 5,
  },
  {
    quote: "As a student, having all my courses, grades, and materials in one place is incredible. The mobile app is especially useful.",
    author: "Emily Rodriguez",
    role: "Computer Science Major",
    institution: "UC Berkeley",
    avatar: "ER",
    rating: 5,
  },
  {
    quote: "Implementation was smooth and the support team was incredibly helpful. We were up and running within a week.",
    author: "Dr. James Wilson",
    role: "IT Director",
    institution: "Harvard University",
    avatar: "JW",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-sidebar text-sidebar-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4 bg-sidebar-accent text-sidebar-foreground">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Trusted by Leading
            <span className="text-primary"> Educational Institutions</span>
          </h2>
          <p className="text-lg text-sidebar-foreground/70">
            See what educators and students are saying about their experience with EdulinkX.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.author}
              className="bg-sidebar-accent border-sidebar-border opacity-0 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <CardContent className="p-6">
                <Quote className="h-10 w-10 text-primary/30 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>

                <p className="text-sidebar-foreground/90 mb-6 text-lg">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-sidebar-foreground/60">{testimonial.role}</div>
                    <div className="text-xs text-primary">{testimonial.institution}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

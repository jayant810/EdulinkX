import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    title: "Quick Setup",
    description: "Get your institution onboarded in minutes with our streamlined setup process. Import existing data seamlessly.",
    color: "primary",
  },
  {
    number: "02",
    title: "Configure Roles",
    description: "Set up administrators, teachers, and students with appropriate permissions and access levels.",
    color: "accent",
  },
  {
    number: "03",
    title: "Add Content",
    description: "Upload courses, materials, and create assessments. Our intuitive interface makes content creation effortless.",
    color: "info",
  },
  {
    number: "04",
    title: "Start Learning",
    description: "Students and teachers can immediately begin using the platform for an enhanced educational experience.",
    color: "success",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Get Started in
            <span className="gradient-primary bg-clip-text text-transparent"> Four Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our intuitive platform makes it easy to transform your institution's digital learning experience.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-success -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: "forwards" }}
              >
                {/* Step Number */}
                <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                  <span className="text-2xl font-bold text-primary-foreground">{step.number}</span>
                </div>

                <h3 className="text-xl font-semibold font-display mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

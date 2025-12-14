import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-12 md:p-20 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
              backgroundSize: "60px 60px"
            }} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm text-primary-foreground font-medium">Start Your Digital Transformation</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold font-display text-primary-foreground mb-6 max-w-3xl mx-auto">
              Ready to Transform Your Institution's Learning Experience?
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join 500+ colleges that have already modernized their education system with EdulinkX. Get started with a free demo today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                asChild
              >
                <Link to="/contact">
                  Book a Free Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/features">
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

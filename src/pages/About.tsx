import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Target, Eye, Heart, Award, Users, Globe, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Innovation",
    description: "We continuously evolve our platform to meet the changing needs of modern education.",
  },
  {
    icon: Heart,
    title: "Student Success",
    description: "Every feature we build is designed with student outcomes as the primary focus.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe in fostering connections between students, teachers, and institutions.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in every aspect of our platform and support.",
  },
];

const stats = [
  { value: "500+", label: "Colleges" },
  { value: "50K+", label: "Students" },
  { value: "5K+", label: "Teachers" },
  { value: "98%", label: "Satisfaction" },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - EdulinkX College LMS</title>
        <meta name="description" content="Learn about EdulinkX - our mission to transform college education with modern learning management technology." />
      </Helmet>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6">About EdulinkX</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Transforming Education
              <span className="gradient-primary bg-clip-text text-transparent"> Through Technology</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              EdulinkX was founded with a simple mission: to make quality education accessible and manageable for institutions of all sizes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="stat" className="border-l-primary">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To empower educational institutions with intuitive, powerful tools that streamline academic operations, enhance student engagement, and foster a culture of continuous learning. We believe that technology should simplify education, not complicate it.
                </p>
              </CardContent>
            </Card>

            <Card variant="stat" className="border-l-accent">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-accent" />
                </div>
                <h2 className="text-2xl font-bold font-display mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  To become the global standard for educational technology, creating a world where every student has access to a seamless learning experience and every teacher has the tools they need to inspire and educate effectively.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">
              Trusted by Institutions Worldwide
            </h2>
            <p className="text-muted-foreground">
              Join the growing community of colleges using EdulinkX.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold font-display gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Our Values</Badge>
            <h2 className="text-3xl font-bold font-display mb-4">
              What Drives Us Forward
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={value.title}
                variant="hover"
                className="text-center opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold font-display mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-sidebar text-sidebar-foreground rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold font-display mb-4">
              Serving Institutions Globally
            </h2>
            <p className="text-sidebar-foreground/70 max-w-2xl mx-auto mb-8">
              From small community colleges to large universities, EdulinkX adapts to the unique needs of educational institutions across the world. Our platform supports multiple languages, currencies, and academic calendars.
            </p>
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/contact">
                Partner With Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;

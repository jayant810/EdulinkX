import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const contactInfo = [
  { icon: Mail, label: "Email", value: "contact@edulinkx.edu" },
  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
  { icon: MapPin, label: "Address", value: "123 Education Street, Learning City, LC 12345" },
  { icon: Clock, label: "Hours", value: "Mon - Fri: 9:00 AM - 6:00 PM" },
];

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    role: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    toast.success("Demo request submitted successfully! We'll contact you soon.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Thank You - EdulinkX</title>
        </Helmet>
        <section className="py-20 lg:py-32 min-h-[80vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-3xl font-bold font-display mb-4 animate-fade-up">
                Thank You for Your Interest!
              </h1>
              <p className="text-muted-foreground mb-8 animate-fade-up stagger-1">
                We've received your demo request. Our team will reach out to you within 24 hours to schedule a personalized demonstration of EdulinkX.
              </p>
              <Button variant="hero" onClick={() => setIsSubmitted(false)} className="animate-fade-up stagger-2">
                Submit Another Request
              </Button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contact Us & Book a Demo - EdulinkX</title>
        <meta name="description" content="Get in touch with EdulinkX. Book a free demo to see how our LMS can transform your institution's learning experience." />
      </Helmet>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6">Get in Touch</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Let's Transform
              <span className="gradient-primary bg-clip-text text-transparent"> Your Institution</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Book a free demo to see EdulinkX in action, or reach out to us with any questions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-display mb-4">Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  Have questions? Reach out to us through any of these channels.
                </p>
              </div>

              {contactInfo.map((info) => (
                <Card key={info.label} variant="hover">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{info.label}</div>
                      <div className="font-medium">{info.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Demo Booking Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-display">Book a Free Demo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Smith"
                          required
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@college.edu"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="college">College/Institution Name *</Label>
                        <Input
                          id="college"
                          name="college"
                          placeholder="Your College Name"
                          required
                          value={formData.college}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border">
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher/Professor</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="it">IT Staff</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your institution's needs..."
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full md:w-auto">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Demo Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="bg-sidebar rounded-2xl p-8 text-center text-sidebar-foreground">
            <h2 className="text-2xl font-bold font-display mb-4">Visit Our Office</h2>
            <p className="text-sidebar-foreground/70 mb-2">
              123 Education Street, Learning City, LC 12345
            </p>
            <p className="text-sm text-sidebar-foreground/50">
              Available for in-person demos by appointment
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;

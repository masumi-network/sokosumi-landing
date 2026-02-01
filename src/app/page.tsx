import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import Platform from "@/components/Platform";
import Stats from "@/components/Stats";
import Deployment from "@/components/Deployment";
import Security from "@/components/Security";
import Testimonial from "@/components/Testimonial";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <Platform />
        <Stats />
        <Deployment />
        <Security />
        <Testimonial />
      </main>
      <CTA />
      <Footer />
    </>
  );
}

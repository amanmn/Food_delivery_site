import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Services from "../components/Services";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import Contact from "../components/Contact";

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <section id="home"><HeroSection /></section>
        <section id="services"><Services /></section>
        <section id="menu"><Menu /></section>
        <section id="contact"><Contact /></section>
      </main>
      <Footer />
    </>
  );
};

export default Home;

import FeatureSection from "@/components/Features"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import Workflow from "@/components/Workflow"

const Home = () => {
  return (
    <>
      <div className="h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] absolute -top-[100px] sm:-top-[150px] lg:-top-[200px] -left-[100px] sm:-left-[150px] lg:-left-[200px] bg-gradient-purple blur-[100px] sm:blur-[150px] lg:blur-[200px] rounded-full"></div>
      <div className="h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] absolute top-[400px] sm:top-[500px] lg:top-[600px] -right-[100px] sm:-right-[150px] lg:-right-[200px] bg-gradient-purple blur-[100px] sm:blur-[150px] lg:blur-[200px] rounded-full"></div>
      <div className="h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] absolute top-[1000px] sm:top-[1200px] lg:top-[1400px] -left-[100px] sm:-left-[150px] lg:-left-[200px] bg-gradient-purple blur-[100px] sm:blur-[150px] lg:blur-[200px] rounded-full"></div>
      <Hero />
      <FeatureSection />
      <Workflow />
      <Footer />
    </>
  )
}

export default Home
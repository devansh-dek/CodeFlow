const Home = () => {
  return (
    <div className="h-dvh w-dvw overflow-hidden">
      <img
        src="images/hero-bg.png"
        className="h-full w-full object-cover max-sm:hidden"
        alt="Hero background"
      />
      <img
        src="images/hero-bg-sm.png"
        className="h-full w-full object-cover sm:hidden"
        alt="Hero background"
      />
      <div className="z-10 absolute top-0 left-0 h-full w-full flex justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center max-w-[500px] w-full">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white">
            <div className="text-center text-gradient-white">Smart Tools</div>
            <div className="text-center">for Smarter Development.</div>
          </div>
          <p className="text-xs sm:text-sm text-center text-zinc-500 mt-6 sm:mt-8 lg:mt-10 px-4 sm:px-0">
            Automate API analysis, visualize workflows, and generate
            documentation—all in one seamless platform.
          </p>
          <div className="flex justify-center items-center w-full">
            <button className="text-xs sm:text-sm font-extrabold hover:bg-white transition-all duration-400 text-black bg-gradient-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 mt-6 sm:mt-8 lg:mt-10 rounded-full">
              GET STARTED
            </button>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] absolute -top-[100px] sm:-top-[150px] lg:-top-[200px] -left-[100px] sm:-left-[150px] lg:-left-[200px] bg-gradient-purple blur-[100px] sm:blur-[150px] lg:blur-[200px] rounded-full"></div>
      <div className="h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] absolute top-[400px] sm:top-[500px] lg:top-[600px] -right-[100px] sm:-right-[150px] lg:-right-[200px] bg-gradient-purple blur-[100px] sm:blur-[150px] lg:blur-[200px] rounded-full"></div>
    </div>
  );
};

export default Home;
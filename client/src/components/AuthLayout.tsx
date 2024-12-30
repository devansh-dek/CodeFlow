import { Outlet } from "react-router";

const benefits = [
  {
    title: "Automated Workflow Visualization",
    icon: "/icons/workflow.png",
    desc: "Instantly generate detailed flowcharts for your backend APIs, making it easier to understand and communicate complex workflows.",
  },
  {
    title: "Effortless Documentation",
    icon: "/icons/docs.png",
    desc: "Automatically create and update comprehensive API documentation, saving time and ensuring consistency across your team.",
  },
  {
    title: "Seamless CI/CD Integration",
    icon: "/icons/cicd.png",
    desc: "Keep your API insights up-to-date with every code push, enabling real-time synchronization with your development pipeline.",
  },
];

const AuthLayout = () => {
  return (
    <div className="h-dvh w-dvw md:flex bg-[#120E25]">
      <div className="max-md:hidden h-full basis-1/2 p-20">
        <img
          src="/icons/codeflow-logo.png"
          alt="Codeflow logo"
          className="h-20"
        />
        <h1 className="text-5xl font-semibold text-white mt-5 overflow-hidden">
          Start your journey with CodeFlow today
        </h1>
        <div className="flex flex-col gap-10 mt-10">
          {benefits.map((benefit, index) => {
            return (
              <div key={index} className="flex flex-col gap-5">
                <div className="text-lg text-white flex gap-5 items-center">
                  <img
                    src={benefit.icon}
                    alt={`${benefit.title} icon`}
                    className="h-5"
                  />
                  {benefit.title}
                </div>
                <div className="text-xs text-zinc-400">{benefit.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-full w-full md:basis-1/2 p-10">
        <div className="h-full w-full bg-glass p-10 flex flex-col justify-center">
          <div className="flex flex-col justify-center items-center">
            <div className="text-white text-xs">Continue with: </div>
            <div className="flex justify-center items-center gap-5 text-white text-xs font-semibold w-full my-5">
              <button className="basis-1/2 bg-glass py-2 flex items-center justify-center gap-5">
                <img
                  src="/icons/google.png"
                  alt="Google icon"
                  className="h-5"
                />
                Google
              </button>
              <button className="basis-1/2 bg-glass py-2 flex items-center justify-center gap-5">
                <img
                  src="/icons/github.png"
                  alt="Github icon"
                  className="h-5"
                />
                Github
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="h-[1px] basis-2/5 bg-zinc-700"></div>
            <div className="text-white basis-1/5 text-center text-xs">Or</div>
            <div className="h-[1px] basis-2/5 bg-zinc-700"></div>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="h-[200px] w-[200px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px] absolute -top-[100px] sm:-top-[150px] lg:-top-[200px] left-[calc(50%-100px)] sm:left-[calc(50%-200px)] lg:left-[calc(50%-250px)] bg-gradient-purple blur-[100px] sm:blur-[200px] rounded-full"></div>
    </div>
  );
};

export default AuthLayout;
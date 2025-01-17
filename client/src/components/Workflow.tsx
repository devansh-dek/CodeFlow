import { CheckCircle2 } from "lucide-react";

const checklistItems = [
  {
    title: "Generate Documentation Effortlessly",
    description:
      "Automatically create detailed and accurate documentation for your repository with minimal effort.",
  },
  {
    title: "Visualize API Workflows",
    description:
      "Understand your project's structure better with dynamically generated flowcharts for your APIs.",
  },
  {
    title: "Interactive AI Code Assistance",
    description:
      "Chat with your codebase to ask questions and resolve issues in real time.",
  },
  {
    title: "Seamless GitHub Integration",
    description:
      "Connect your GitHub repository to keep your documentation and flowcharts updated automatically.",
  },
];

const Workflow = () => {
  return (
    <div className="bg-[#120E25]">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center text-white font-bold mt-6 tracking-wide mb-20">
        Accelerate your{" "}
        <span className="text-gradient-white">
          coding workflow.
        </span>
      </h2>
      <div className="flex flex-wrap justify-center p-10">
        <div className="p-2 w-full lg:w-1/2 flex items-center">
          <img src="/images/dashboard.png" alt="Dashboard" className="rounded-xl" />
        </div>
        <div className="pt-12 w-full lg:w-1/2">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex mb-12">
              <div className="text-green-400 mx-6 h-10 w-10 p-2 justify-center items-center rounded-full">
                <CheckCircle2 />
              </div>
              <div>
                <h5 className="mt-1 mb-2 text-xl text-white">{item.title}</h5>
                <p className="text-md text-zinc-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workflow;

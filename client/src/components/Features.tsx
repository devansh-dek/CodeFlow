import { BotMessageSquare, Cloud, FileText, GitBranch, LineChart, ShieldHalf } from "lucide-react";

export const features = [
  {
    icon: <FileText />,
    text: "Automated Documentation",
    description:
      "Generate detailed and professional documentation for your GitHub repository automatically, saving time and effort.",
  },
  {
    icon: <LineChart />,
    text: "API Flowchart Generation",
    description:
      "Visualize your API workflows with dynamically generated flowcharts, making it easier to understand and share your project's structure.",
  },
  {
    icon: <BotMessageSquare />,
    text: "Interactive Code Chat",
    description:
      "Engage with your code through an AI-powered chatbot to ask relevant questions and get instant answers about your repository.",
  },
  {
    icon: <GitBranch />,
    text: "GitHub Integration",
    description:
      "Seamlessly integrate with your GitHub repository to analyze code, identify APIs, and keep your documentation up-to-date.",
  },
  {
    icon: <Cloud />,
    text: "CI/CD Pipeline Updates",
    description:
      "Automatically update flowcharts and documentation in your CI/CD pipeline whenever new code is pushed.",
  },
  {
    icon: <ShieldHalf />,
    text: "Secure Code Handling",
    description:
      "Ensure the security and privacy of your repository with robust measures for safe code analysis and storage.",
  },
];

const FeatureSection = () => {
  return (
    <div className="bg-[#120E25] min-h-[800px]">
      <div className="text-center">
        <h2 className="text-3xl text-white sm:text-5xl lg:text-6xl font-bold mt-10 lg:mt-20 tracking-wide">
          Easily build{" "}
          <span className="text-gradient-white">
            your code
          </span>
        </h2>
      </div>
      <div className="flex flex-wrap mt-10 lg:mt-20 p-10">
        {features.map((feature, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3">
            <div className="flex">
              <div className="flex mx-6 h-10 w-10 text-white justify-center items-center rounded-full">
                {feature.icon}
              </div>
              <div>
                <h5 className="mt-1 mb-6 text-lg text-white">{feature.text}</h5>
                <p className="text-sm p-2 mb-20 text-neutral-500">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;

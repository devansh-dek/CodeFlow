import axiosConfig from "@/api/axiosConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookText, Github } from "lucide-react";
import { useEffect, useState } from "react";

const AddProject = () => {
  const [projectName, setProjectName] = useState("");
  const [repoLink, setRepoLink] = useState("");

  async function createProject() {
    console.log({ repoUrl: repoLink, title: projectName });
    try {
      const response = await axiosConfig.post(
        "/api/process-repository",
        { repoUrl: repoLink, title: projectName },
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="flex items-center justify-center m-10 mt-20 gap-20">
      <img
        src="/svg/add-project.svg"
        alt="Create project"
        className="h-[300px]"
      />
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-white text-4xl overflow-y-hidden">
            Link your GitHub Repository
          </h2>
          <p className="text-zinc-400 text-sm">
            Enter the URL of your GitHub repository to link it to CodeFlow
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex gap-5 items-center px-3 py-1 border-zinc-700 border-2 rounded-xl">
            <BookText />
            <Input
              type="text"
              placeholder="Project name"
              className="border-none"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="flex gap-5 items-center px-3 py-1 border-zinc-700 border-2 rounded-xl">
            <Github />
            <Input
              type="text"
              placeholder="https://github.com/<username>/<repo-name>"
              className="border-none"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={createProject}
          className="w-fit px-5 py-2 bg-[#7d6add] text-zinc-900 font-semibold hover:bg-zinc-900 hover:text-[#7d6add]"
        >
          Create Project <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default AddProject;

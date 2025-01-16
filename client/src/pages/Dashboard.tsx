import axiosConfig from "@/api/axiosConfig";
import { projects } from "@/utils/constants";
import { ArrowRight, GitBranch } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-zinc-500">Welcome back, Agnish</h2>
        <h1 className="text-4xl text-white">Projects Overview </h1>
        <div className="flex flex-wrap my-10">
          {projects.map((project, index) => {
            return (
              <div className="p-5 basis-1/3">
                <div
                  className="rounded-lg bg-zinc-900 p-5 text-white"
                  key={index}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <h2 className="text-base font-medium">{project.name}</h2>
                      <p className="text-sm text-zinc-400">
                        {project.repo_link.split("/")[4]}
                      </p>
                    </div>
                    <div
                      className="ml-auto cursor-pointer"
                      onClick={() => navigateTo(`/project/${project.repo_link.split("/")[4]}`)}
                    >
                      <div className="rounded-full bg-[#7d6add] hover:bg-zinc-700 p-2">
                        <ArrowRight className="h-5 text-black" />
                      </div>
                    </div>
                  </div>
                  <a
                    href={project.repo_link}
                    className="mt-3 flex items-center cursor-pointer gap-2 rounded-full bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-700"
                  >
                    <img className="h-5" src="/icons/github.png" />
                    <span>{project.repo_link.substring(18)}</span>
                  </a>
                  <div className="mt-3 text-sm text-zinc-400">
                    <p>{project.commits[project.commits.length - 1].message}</p>
                    <p className="mt-1 flex">
                      {project.commits[project.commits.length - 1].date} on{" "}
                      <GitBranch className="h-5" />{" "}
                      {project.commits[project.commits.length - 1].branch}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

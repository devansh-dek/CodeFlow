import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { projects } from '@/utils/constants';
import mermaid from 'mermaid';
import ChatBox from '@/components/Chatbox';

interface Commit {
  message: string;
  date: string;
  branch: string;
}

interface APIEndpoint {
  method: string;
  route: string;
  description: string;
}

interface Documentation {
  overview: string;
  setup: string;
  features: string[];
  api: {
    endpoints: APIEndpoint[];
  };
}

interface Project {
  id: number;
  name: string;
  repo_link: string;
  commits: Commit[];
  documentation: Documentation;
  flowchart: string;
}

const Project = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const mermaidRef = useRef<HTMLDivElement>(null);

  const project = projects.find((project) => project.repo_link.split('/')[4] === title);

  useEffect(() => {
    const initializeMermaid = async () => {
      if (mermaidRef.current && project) {
        // Reset the container
        mermaidRef.current.innerHTML = '';
        
        // Initialize mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'basis'
          }
        });

        try {
          // Create unique ID for the diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, project.flowchart);
          mermaidRef.current.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          mermaidRef.current.innerHTML = 'Failed to load diagram';
        }
      }
    };

    initializeMermaid();
  }, [project]);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="fixed inset-0 bg-zinc-950">
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dash')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <p className="text-zinc-400">{project.repo_link.split('/')[4]}</p>
          </div>
          <ChatBox />
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        <div className="w-1/3 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Recent Commits</h2>
            {project.commits.map((commit, index) => (
              <div key={index} className="bg-zinc-900 rounded-lg p-4 text-white">
                <p className="font-medium">{commit.message}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                  <span>{commit.date}</span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    {commit.branch}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/3 overflow-y-auto border-l border-zinc-800">
          <div className="p-6 space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Documentation</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Overview</h3>
                  <p className="text-zinc-300">{project.documentation.overview}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Setup</h3>
                  <pre className="bg-zinc-800 p-4 rounded-lg text-sm">
                    {project.documentation.setup}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Features</h3>
                  <ul className="list-disc pl-6 text-zinc-300">
                    {project.documentation.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
                  <div className="space-y-2">
                    {project.documentation.api.endpoints.map((endpoint, index) => (
                      <div key={index} className="bg-zinc-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-mono">{endpoint.method}</span>
                          <span className="font-mono">{endpoint.route}</span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">{endpoint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">System Architecture</h2>
              <div className="h-[400px] bg-zinc-800 rounded-lg p-4">
                <div ref={mermaidRef} className="h-full overflow-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
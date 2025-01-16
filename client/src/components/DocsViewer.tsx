import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Code, FileText, GitBranch } from "lucide-react";
import axiosConfig from "@/api/axiosConfig";

interface Technologies {
  frontend: string[];
  backend: string[];
  database: string[];
  tools: string[];
}

interface Overview {
  projectPurpose: string;
  mainFeatures: string[];
  technologies: Technologies;
}

interface Component {
  name: string;
  type: string;
  connections: string[];
}

interface Architecture {
  diagram: string;
  components: Component[];
}

interface Parameter {
  name: string;
  type: string;
  description: string;
}

interface Method {
  name: string;
  description: string;
  parameters: Parameter[];
  returns?: {
    type: string;
    description: string;
  };
}

interface ComponentDoc {
  name: string;
  type: string;
  purpose: string;
  parameters: Parameter[];
  methods?: Method[];
  examples?: string[];
}

interface Documentation {
  overview: Overview;
  architecture: Architecture;
  components: ComponentDoc[];
}

interface DocsViewerProps {
  repositoryTitle: string;
}

const DocsViewer: React.FC<DocsViewerProps> = ({ repositoryTitle }) => {
  const [documentation, setDocumentation] =
    React.useState<Documentation | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await axiosConfig.get<{ documentation: Documentation }>(
          `/api/repository/${repositoryTitle}/docs`,
          { withCredentials: true }
        );
        console.log(response.data);
        setDocumentation(response.data.documentation);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [repositoryTitle]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        Loading documentation...
      </div>
    );
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!documentation) return <div>No documentation available</div>;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="architecture">
            <GitBranch className="w-4 h-4 mr-2" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="components">
            <Code className="w-4 h-4 mr-2" />
            Components
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Purpose</h3>
                <p>{documentation.overview.projectPurpose}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Main Features</h3>
                <ul className="list-disc pl-6">
                  {documentation.overview.mainFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Technologies</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(documentation.overview.technologies).map(
                    ([category, techs]) => (
                      <div key={category}>
                        <h4 className="font-medium capitalize mb-2">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {techs.map((tech, index) => (
                            <Badge key={index} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="mermaid">
                  {documentation.architecture.diagram}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Components</h3>
                {documentation.architecture.components.map(
                  (component, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Badge>{component.type}</Badge>
                        <h4 className="font-medium">{component.name}</h4>
                      </div>
                      {component.connections.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Connects to:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {component.connections.map((conn, idx) => (
                              <div key={idx} className="flex items-center">
                                <ChevronRight className="w-4 h-4" />
                                <span>{conn}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <div className="space-y-4">
            {documentation.components.map((component, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{component.name}</CardTitle>
                    <Badge>{component.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Purpose</h3>
                    <p>{component.purpose}</p>
                  </div>

                  {component.parameters.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Parameters</h3>
                      <div className="space-y-2">
                        {component.parameters.map((param, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-gray-200 pl-4"
                          >
                            <p className="font-medium">
                              {param.name}:{" "}
                              <span className="text-gray-600">
                                {param.type}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {component.methods?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Methods</h3>
                      <div className="space-y-4">
                        {component.methods.map((method, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{method.name}</h4>
                            <p className="text-gray-600 mb-2">
                              {method.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {component.examples?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Examples</h3>
                      <div className="space-y-2">
                        {component.examples.map((example, idx) => (
                          <pre
                            key={idx}
                            className="bg-gray-100 p-4 rounded-lg overflow-x-auto"
                          >
                            <code>{example}</code>
                          </pre>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocsViewer;

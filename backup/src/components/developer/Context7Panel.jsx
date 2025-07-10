import { useState } from 'react';
import { useContext7 } from '@/hooks/useContext7';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, FileText, Info } from 'lucide-react';

export function Context7Panel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [queryProject, setQueryProject] = useState('react');
  const [queryTopic, setQueryTopic] = useState('');
  const [activeTab, setActiveTab] = useState('query');
  
  const {
    query,
    search,
    getInfo,
    getProjectContext,
    loading,
    error,
    results,
    clearResults,
  } = useContext7();

  const handleQuery = async () => {
    if (!queryTopic.trim()) return;
    await query(queryProject, queryTopic);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    await search(searchTerm);
  };

  const handleProjectInfo = async (project) => {
    await getInfo(project);
  };

  const handleProjectContext = async () => {
    if (!queryTopic.trim()) return;
    await getProjectContext(queryTopic);
  };

  const commonProjects = ['react', 'vite', 'tailwindcss', 'postgresql', 'nodejs', 'typescript'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Context7 Documentation Helper</CardTitle>
        <CardDescription>
          Query documentation for various frameworks and libraries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="context">Project Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="query" className="space-y-4">
            <div className="flex gap-2">
              <select
                value={queryProject}
                onChange={(e) => setQueryProject(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {commonProjects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Enter topic to query..."
                value={queryTopic}
                onChange={(e) => setQueryTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                className="flex-1"
              />
              <Button onClick={handleQuery} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Query
              </Button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Quick queries:</span>
              <Button variant="outline" size="sm" onClick={() => { setQueryTopic('hooks'); handleQuery(); }}>
                React Hooks
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setQueryProject('tailwindcss'); setQueryTopic('responsive design'); handleQuery(); }}>
                Responsive Design
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setQueryProject('postgresql'); setQueryTopic('indexes'); handleQuery(); }}>
                DB Indexes
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="context" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter topic to get context across all tech stack..."
                value={queryTopic}
                onChange={(e) => setQueryTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleProjectContext()}
                className="flex-1"
              />
              <Button onClick={handleProjectContext} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Info className="h-4 w-4" />}
                Get Context
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This will search across React, Vite, Tailwind CSS, and PostgreSQL documentation
            </p>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Results</h3>
              <Button variant="ghost" size="sm" onClick={clearResults}>
                Clear
              </Button>
            </div>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <pre className="text-sm whitespace-pre-wrap">
                {typeof results === 'object' ? JSON.stringify(results, null, 2) : results}
              </pre>
            </ScrollArea>
          </div>
        )}
        
        {activeTab === 'search' && !loading && !results && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Popular projects:</span>
            {commonProjects.map((project) => (
              <Button
                key={project}
                variant="outline"
                size="sm"
                onClick={() => handleProjectInfo(project)}
              >
                {project}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
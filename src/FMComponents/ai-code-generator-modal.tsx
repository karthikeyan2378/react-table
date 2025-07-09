
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface AiCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: any[];
  onGenerate: (prompt: string, data: any[]) => Promise<string>;
}

export function AiCodeGeneratorModal({ isOpen, onClose, selectedData, onGenerate }: AiCodeGeneratorModalProps) {
  const [prompt, setPrompt] = useState('Create a React component to display this data in a list.');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Prompt is empty', description: 'Please enter instructions for the AI.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedCode('');
    try {
      const code = await onGenerate(prompt, selectedData);
      setGeneratedCode(code);
    } catch (error) {
      // Error toast is handled in the parent component
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: 'Copied to clipboard!', description: 'The generated code has been copied.' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Code Generator</DialogTitle>
          <DialogDescription>
            Use the selected data as context to generate code with AI. 
            You have <Badge variant="secondary">{selectedData.length}</Badge> row(s) selected.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
          {/* Left Panel: Data and Prompt */}
          <div className="flex flex-col gap-4">
            <div className="flex-grow flex flex-col border rounded-md min-h-0">
                <h3 className="text-sm font-medium p-2 border-b">Selected Data (JSON)</h3>
                <ScrollArea className="flex-grow p-2">
                    <pre className="text-xs">{JSON.stringify(selectedData, null, 2)}</pre>
                </ScrollArea>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="prompt" className="text-sm font-medium">Prompt</label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a TypeScript interface for this data structure."
                className="h-24"
              />
            </div>
          </div>
          
          {/* Right Panel: Generated Code */}
          <div className="flex flex-col border rounded-md min-h-0">
            <div className="flex items-center justify-between p-2 border-b">
                 <h3 className="text-sm font-medium">Generated Code</h3>
                 {generatedCode && !isLoading && (
                    <Button size="sm" variant="outline" onClick={handleCopy}>Copy</Button>
                 )}
            </div>
            <ScrollArea className="flex-grow p-2 bg-gray-50 rounded-b-md">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p>Generating...</p>
                    </div>
                ) : (
                    <pre className="text-xs whitespace-pre-wrap"><code className="language-javascript">{generatedCode}</code></pre>
                )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={handleGenerate} disabled={isLoading || selectedData.length === 0}>
            {isLoading ? 'Generating...' : 'Generate Code'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add this to your component imports if you need a specific component for ScrollArea
// This is a basic implementation that you might already have.
// import { ScrollArea } from './ui/scroll-area';
// If not, here's a basic scroll area component structure.
// You might need to create this file: src/FMComponents/ui/scroll-area.tsx
/**
 * export const ScrollArea = ({ className, children }) => (
 *   <div className={cn("overflow-auto", className)}>
 *     {children}
 *   </div>
 * );
 */

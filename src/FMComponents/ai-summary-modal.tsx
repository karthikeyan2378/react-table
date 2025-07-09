
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Copy, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
  onGenerateSummary: () => void;
}

export function AiSummaryModal({
  isOpen,
  onClose,
  summary,
  isLoading,
  onGenerateSummary,
}: AiSummaryModalProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: 'Copied to Clipboard',
      description: 'The AI summary has been copied.',
    });
  };

  React.useEffect(() => {
    // Automatically trigger summary generation when the modal opens, if no summary exists.
    if (isOpen && !summary && !isLoading) {
      onGenerateSummary();
    }
  }, [isOpen, summary, isLoading, onGenerateSummary]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI-Powered Alarm Summary
          </DialogTitle>
          <DialogDescription>
            An expert analysis of the current alarms in the table.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 min-h-[200px] rounded-md border bg-gray-50 p-4 whitespace-pre-wrap">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-sm text-gray-500">
                Analyzing alarms...
              </p>
            </div>
          ) : (
            <p className="text-sm">{summary || 'Click "Generate Summary" to begin.'}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
            <div className='flex gap-2'>
                <Button 
                    variant="default" 
                    onClick={onGenerateSummary} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                        </>
                    ) : (
                        "Regenerate"
                    )}
                </Button>
                {summary && !isLoading && (
                    <Button variant="outline" onClick={handleCopy}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                )}
            </div>
            <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

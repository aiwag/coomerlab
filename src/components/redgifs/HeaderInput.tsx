// src/components/redgifs/HeaderInput.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { setHeadersFromCurl } from '@/services/redgifs'
import { toast } from 'sonner'
import { Code, Upload } from 'lucide-react'

interface HeaderInputProps {
  onHeadersSet: () => void
}

export function HeaderInput({ onHeadersSet }: HeaderInputProps) {
  const [curlCommand, setCurlCommand] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  const handleSetHeaders = () => {
    if (!curlCommand.trim()) {
      toast.error('Please enter a cURL command')
      return
    }
    
    const success = setHeadersFromCurl(curlCommand)
    if (success) {
      toast.success('Headers extracted successfully')
      onHeadersSet()
      setIsOpen(false)
      setCurlCommand('')
    } else {
      toast.error('Failed to extract headers from cURL command')
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Import Headers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import RedGifs Headers</DialogTitle>
          <DialogDescription>
            Paste a cURL command from RedGifs to extract the authentication headers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="curl-command">cURL Command</Label>
            <Textarea
              id="curl-command"
              placeholder="curl 'https://api.redgifs.com/v2/feeds/trending/popular?page=1&count=100' \ -H 'accept: application/json, text/plain, */*' \ -H 'authorization: Bearer ...'"
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSetHeaders} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Headers
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
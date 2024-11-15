'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast";
export default function ProductCreationPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!title || !description || images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields and upload at least one image.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (images.length > 10) {
      toast({
        title: "Too Many Images",
        description: "Please select up to 10 images only.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (tags) {
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())))
    }
    images.forEach(image => formData.append('images', image))

    try {
      const response = await fetch(`http://localhost:4000/addcars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create car')
      }

      toast({
        title: "Success",
        description: "Car created successfully!",
      })
      router.push('/pages/allcars')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create car. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Car</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. sedan, luxury, electric"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Images (up to 10)</Label>
                <Input
                  id="images"
                  type="file"
                  onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 10))}
                  multiple
                  accept="image/*"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Car'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
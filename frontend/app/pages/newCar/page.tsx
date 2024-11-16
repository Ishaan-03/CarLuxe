'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Plus, X, Car } from 'lucide-react'

export default function ProductCreationPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prevImages => {
      const newImages = [...prevImages, ...files]
      return newImages.slice(0, 10) 
    })
  }

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index))
  }

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

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (tags) {
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())))
    }
    images.forEach(image => formData.append('images', image))

    try {
      const response = await fetch(`https://carluxe-production.up.railway.app/addcars`, {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Car className="mr-2" />
              Add New Car
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-lg"
                  placeholder="Enter car title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="text-lg min-h-[100px]"
                  placeholder="Describe your car"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-lg">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. sedan, luxury, electric"
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images" className="text-lg">Images (up to 10)</Label>
                <Input
                  id="images"
                  type="file"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="text-lg"
                />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label htmlFor="add-image" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary">
                      <Plus size={24} />
                      <input
                        id="add-image"
                        type="file"
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full text-lg" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Car'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
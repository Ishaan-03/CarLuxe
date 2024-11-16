'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ChevronLeft, ChevronRight, Edit, Trash, Plus, X } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"

interface Car {
  id: string
  title: string
  description: string
  tags: string[]
  images: string[]
  userId: string
}

export default function ProductDetailPage() {
  const [car, setCar] = useState<Car | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (id) fetchCarDetails()
  }, [id])

  const fetchCarDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://carluxe-production.up.railway.app/cars/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch car details')
      const data = await response.json()
      setCar(data)
      setTitle(data.title)
      setDescription(data.description)
      setTags(data.tags.join(', '))
    } catch (error) {
      console.error("Failed to fetch car details. Please try again.", error)
      setError('Failed to fetch car details')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages(prevImages => {
      const updatedImages = [...prevImages, ...files]
      return updatedImages.slice(0, 10 - (car?.images.length || 0)) // Limit to 10 total images
    })
  }

  const removeNewImage = (index: number) => {
    setNewImages(prevImages => prevImages.filter((_, i) => i !== index))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())))
    newImages.forEach(image => formData.append('images', image))

    try {
      const response = await fetch(`https://carluxe-production.up.railway.app/cars/update/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Failed to update car')

      toast({
        title: "Success",
        description: "Car updated successfully!",
      })
      setIsEditing(false)
      fetchCarDetails()
    } catch (error) {
      console.error("Failed to update car. Please try again.", error)
      setError('Failed to update car')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`https://carluxe-production.up.railway.app/cars/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) throw new Error('Failed to delete car')

        toast({
          title: "Success",
          description: "Car deleted successfully!",
        })
        router.push('/pages/mylistings')
      } catch (error) {
        console.error("Failed to delete car. Please try again.", error)
        setError('Failed to delete car')
      } finally {
        setLoading(false)
      }
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (car?.images.length || 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (car?.images.length || 1)) % (car?.images.length || 1))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!car) return <div>Car not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl font-bold">{isEditing ? 'Edit Car' : car.title}</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-lg"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-lg">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    required
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newImages" className="text-lg">Add New Images (up to 10 total)</Label>
                  <Input
                    id="newImages"
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    className="text-lg"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {car.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${car.title} - ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                    ))}
                    {newImages.map((image, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {car.images.length + newImages.length < 10 && (
                      <label htmlFor="add-more-images" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary">
                        <Plus size={24} />
                        <input
                          id="add-more-images"
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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            ) : (
              <>
                <div className="relative mb-6 h-96">
                  <img
                    src={car.images[currentImageIndex]}
                    alt={`${car.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 left-2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 right-2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-2xl font-bold mb-4">{car.title}</h2>
                <p className="mb-4 text-muted-foreground">{car.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {car.tags.map((tag, index) => (
                    <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
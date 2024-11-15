'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (id) fetchCarDetails()
  }, [id])

  const fetchCarDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/cars/${id}`, {
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
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())))
    newImages.forEach(image => formData.append('images', image))

    try {
      const response = await fetch(`http://localhost:4000/cars/update/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Failed to update car')

      console.log("Car updated successfully!")
      setIsEditing(false)
      fetchCarDetails()
    } catch (error) {
      console.error("Failed to update car. Please try again.", error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const response = await fetch(`http://localhost:4000/cars/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) throw new Error('Failed to delete car')

        console.log("Car deleted successfully!")
        router.push('/cars')
      } catch (error) {
        console.error("Failed to delete car. Please try again.", error)
      }
    }
  }

  if (!car) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{isEditing ? 'Edit Car' : car.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newImages">Add New Images</Label>
                  <Input
                    id="newImages"
                    type="file"
                    onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                    multiple
                    accept="image/*"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            ) : (
              <>
                <p className="mb-4">{car.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {car.tags.map((tag, index) => (
                    <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {car.images.map((image, index) => (
                    <img key={index} src={image} alt={`${car.title} - ${index + 1}`} className="w-full h-40 object-cover rounded-md" />
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
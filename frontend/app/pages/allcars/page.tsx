'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from 'lucide-react'

interface Car {
  id: string
  title: string
  description: string
  tags: string[]
  images: string[]
}

export default function ProductListPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch('http://localhost:4000/cars', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch cars')
      const data = await response.json()
      setCars(data)
    } catch (error) {
      console.error("Failed to fetch cars. Please try again.", error)
    }
  }

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:4000/cars/search?keyword=${searchKeyword}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setCars(data)
    } catch (error) {
      console.error("Search failed. Please try again.", error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Your Cars</h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search cars..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          <Button onClick={() => router.push('/pages/newCar')}>
            <Plus className="mr-2 h-4 w-4" /> Add New Car
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <motion.div key={car.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="cursor-pointer" onClick={() => router.push(`/cars/${car.id}`)}>
                <CardHeader>
                  <CardTitle>{car.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={car.images[0]} alt={car.title} className="w-full h-48 object-cover rounded-md mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">{car.description.substring(0, 100)}...</p>
                  <div className="flex flex-wrap gap-2">
                    {car.tags.map((tag, index) => (
                      <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
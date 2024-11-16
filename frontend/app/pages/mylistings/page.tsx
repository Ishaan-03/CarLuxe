'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Car, Menu, User } from 'lucide-react'

interface Car {
  id: string
  title: string
  description: string
  tags: string[]
  images: string[]
}

export default function MyListingsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMyCars()
  }, [])

  const fetchMyCars = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://carluxe-production.up.railway.app/cars/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch your cars')
      const data = await response.json()
      setCars(data)
    } catch (error) {
      console.error("Failed to fetch your cars. Please try again.", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://carluxe-production.up.railway.app/cars/search?keyword=${searchKeyword}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      const userCars = data.filter((car: Car) => cars.some(userCar => userCar.id === car.id))
      setCars(userCars)
    } catch (error) {
      console.error("Search failed. Please try again.", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">CarLuxe</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" onClick={() => router.push('/pages/allcars')}>All Cars</Button>
            <Button variant="ghost" onClick={() => router.push('/pages/newCar')}>Add New Car</Button>
          </div>
          <Button variant="ghost" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-800 shadow-md"
            >
              <div className="container mx-auto px-6 py-3 flex flex-col space-y-2">
                <Button variant="ghost" onClick={() => router.push('/pages/allcars')}>All Cars</Button>
                <Button variant="ghost" onClick={() => router.push('/pages/newCar')}>Add New Car</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center">
              <User className="mr-2 h-8 w-8" />
              My Listed Cars
            </h1>
            <Button onClick={() => router.push('/pages/newCar')} className="bg-primary hover:bg-primary-dark text-white">
              <Plus className="mr-2 h-4 w-4" /> Add New Car
            </Button>
          </div>

          <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <Input
                  type="text"
                  placeholder="Search your cars..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full md:w-64 mb-4 md:mb-0"
                />
                <Button onClick={handleSearch} className="w-full md:w-auto">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : cars.length === 0 ? (
            <Card className="text-center py-16 bg-white dark:bg-gray-800 shadow-lg">
              <CardContent>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Car className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">You haven't listed any cars yet.</p>
                  <Button className="bg-primary hover:bg-primary-dark text-white" onClick={() => router.push('/pages/newCar')}>
                    List Your First Car
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <motion.div
                  key={car.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800" onClick={() => router.push(`/pages/productdetails/${car.id}`)}>
                    <div className="relative h-48">
                      <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <CardTitle className="absolute bottom-2 left-2 text-white text-xl font-bold">{car.title}</CardTitle>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{car.description.substring(0, 100)}...</p>
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
          )}
        </motion.div>
      </main>
    </div>
  )
}
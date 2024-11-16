'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, ArrowRight, Check, Search, UserPlus, Key } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">CarLuxe</span>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" onClick={() => router.push('/pages/authpage')}>Browse Cars</Button>
            <Button variant="ghost" onClick={() => router.push('/pages/authpage')}>Login</Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">
              Your Journey to the Perfect Car Starts Here
            </h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
              Discover a world of automotive excellence. Whether you're buying or selling, 
              CarFinder is your trusted partner in the car marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button onClick={() => router.push('/pages/authpage')} className="flex-1">
                Browse Cars <Search className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => router.push('/pages/authpage')} variant="outline" className="flex-1">
                Sign Up Now <UserPlus className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-4">
              {[
                { icon: Search, text: 'Wide selection of quality cars' },
                { icon: UserPlus, text: 'Easy account creation and management' },
                { icon: Key, text: 'Secure and trusted transactions' }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center text-gray-600 dark:text-gray-300"
                >
                  <item.icon className="mr-2 h-5 w-5 text-primary" />
                  {item.text}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src="https://i.pinimg.com/736x/b1/44/7c/b1447cc5f697173d513f3871d450ec80.jpg" 
                  alt="Find your dream car" 
                  className="w-full h-[400px] object-cover"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <section className="mt-24">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            Why Choose CarFinder?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Extensive Selection", description: "From luxury to economy, find the perfect car that fits your needs and budget." },
              { title: "Verified Sellers", description: "Our rigorous verification process ensures you're dealing with trusted sellers." },
              { title: "Seamless Experience", description: "User-friendly interface makes buying and selling cars a breeze." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">Join thousands of satisfied users and find your dream car today!</p>
          <Button onClick={() => router.push('/pages/authpage')} size="lg" className="text-lg px-8">
            Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-md mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Car className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">CarFinder</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost">About Us</Button>
              <Button variant="ghost">Contact</Button>
              <Button variant="ghost">Terms of Service</Button>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} CarFinder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
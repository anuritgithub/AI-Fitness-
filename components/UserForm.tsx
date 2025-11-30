'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserData } from '@/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function UserForm({ onSubmit }: { onSubmit: (data: UserData) => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    name: '',
    age: 25,
    gender: 'male',
    height: 170,
    weight: 70,
    fitnessGoal: 'general-fitness',
    fitnessLevel: 'beginner',
    workoutLocation: 'home',
    dietaryPreference: 'vegetarian',
    medicalHistory: '',
    stressLevel: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <Card className="w-full bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900/90 backdrop-blur-md border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Logo + Header */}
        <div className="flex flex-col items-center pt-6">
          <Image src="/logo.jpg" alt="Fitness Logo" width={80} height={80} className="rounded-full shadow-xl" />
          <CardTitle className="text-3xl font-bold text-white mt-3 bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent animate-gradient">
            Personal Fitness Profile
          </CardTitle>
          <CardDescription className="text-gray-300 mt-1 text-center">
            Fill in your details to get a customized AI-powered fitness plan
          </CardDescription>
        </div>

        <CardContent className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Personal Info Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold text-yellow-400 border-b border-yellow-500 pb-2">Personal Info</h3>

              <div className="space-y-3">
                <Label htmlFor="name" className="text-gray-200">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  className="bg-gray-800 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="age" className="text-gray-200">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    required
                    className="bg-gray-800 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-500 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                    className="flex items-center space-x-6 mt-1"
                  >
                    {['male', 'female', 'other'].map((g) => (
                      <div key={g} className="flex items-center space-x-2">
                        <RadioGroupItem value={g} id={g} className="border-gray-500 checked:bg-yellow-400 checked:border-yellow-400" />
                        <Label htmlFor={g} className="text-gray-200">{g.charAt(0).toUpperCase() + g.slice(1)}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="height" className="text-gray-200">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    required
                    className="bg-gray-800 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-500 rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="weight" className="text-gray-200">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                    required
                    className="bg-gray-800 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-500 rounded-xl"
                  />
                </div>
              </div>
            </section>

            {/* Fitness Details Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold text-pink-400 border-b border-pink-500 pb-2">Fitness Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-200">Fitness Goal</Label>
                  <Select
                    value={formData.fitnessGoal}
                    onValueChange={(value: any) => setFormData({ ...formData, fitnessGoal: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:ring-pink-400 focus:border-pink-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="weight-loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                      <SelectItem value="general-fitness">General Fitness</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-200">Fitness Level</Label>
                  <Select
                    value={formData.fitnessLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, fitnessLevel: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:ring-pink-400 focus:border-pink-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-200">Workout Location</Label>
                  <Select
                    value={formData.workoutLocation}
                    onValueChange={(value: any) => setFormData({ ...formData, workoutLocation: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:ring-pink-400 focus:border-pink-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-200">Dietary Preference</Label>
                  <Select
                    value={formData.dietaryPreference}
                    onValueChange={(value: any) => setFormData({ ...formData, dietaryPreference: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:ring-pink-400 focus:border-pink-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Optional Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500 pb-2">Optional Details</h3>

              <div className="space-y-3">
                <Label className="text-gray-200">Medical History</Label>
                <Textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Any injuries, conditions, or medications..."
                  className="bg-gray-800 border-gray-600 text-white rounded-xl focus:ring-purple-400 focus:border-purple-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200">Stress Level</Label>
                <Select
                  value={formData.stressLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, stressLevel: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:ring-purple-400 focus:border-purple-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-5 text-lg font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:brightness-105 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : '💪 Generate My Fitness Plan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

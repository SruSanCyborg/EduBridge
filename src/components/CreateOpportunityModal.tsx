'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface CreateOpportunityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (opportunityData: any) => Promise<void>
  userType: string
}

const opportunityTypes = [
  { value: 'scholarship', label: 'Scholarship', icon: AcademicCapIcon, description: 'Financial aid for education' },
  { value: 'internship', label: 'Internship', icon: BriefcaseIcon, description: 'Work experience opportunity' },
  { value: 'mentorship', label: 'Mentorship', icon: UserGroupIcon, description: 'One-on-one guidance program' },
  { value: 'equipment-donation', label: 'Equipment Donation', icon: DocumentTextIcon, description: 'Laptops, books, tools' },
  { value: 'course-sponsorship', label: 'Course Sponsorship', icon: GlobeAltIcon, description: 'Fund online courses' },
  { value: 'research-grant', label: 'Research Grant', icon: CheckCircleIcon, description: 'Support research projects' }
]

const categories = [
  'Technology', 'Healthcare', 'Education', 'Business', 'Arts', 'Sciences', 'Social Work', 'Environment', 'General'
]

const educationLevels = [
  'High School', 'Undergraduate', 'Graduate', 'Masters', 'PhD', 'Any Level'
]

export default function CreateOpportunityModal({ isOpen, onClose, onSubmit, userType }: CreateOpportunityModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    type: 'scholarship',
    category: 'Technology',
    
    // Financial Details
    budget: {
      amount: '',
      currency: 'USD',
      type: 'fixed'
    },
    
    // Timeline
    applicationDeadline: '',
    selectionDate: '',
    
    // Eligibility
    eligibility: {
      minAge: '',
      maxAge: '',
      educationLevel: ['Any Level'],
      location: {
        countries: [''],
        states: [''],
        cities: ['']
      },
      gpaRequirement: '',
      subjects: [''],
      otherCriteria: ['']
    },
    
    // Application Requirements
    maxApplicants: '',
    requiredDocuments: ['Resume/CV'],
    applicationQuestions: [
      { question: 'Why are you interested in this opportunity?', type: 'essay', required: true },
      { question: 'What are your career goals?', type: 'essay', required: true },
      { question: 'How will this opportunity help you?', type: 'essay', required: true }
    ],
    
    // Settings
    status: 'active',
    visibility: 'public'
  })

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0] as keyof typeof prev], [keys[1]]: value }
      }))
    } else if (keys.length === 3) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof typeof prev],
          [keys[1]]: {
            ...prev[keys[0] as keyof typeof prev][keys[1] as keyof any],
            [keys[2]]: value
          }
        }
      }))
    }
  }

  const addArrayItem = (field: string, item: string = '') => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field as keyof typeof prev] as any[], item]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof typeof prev],
          [keys[1]]: {
            ...prev[keys[0] as keyof typeof prev][keys[1] as keyof any],
            [keys[2]]: [...prev[keys[0] as keyof typeof prev][keys[1] as keyof any][keys[2] as keyof any], item]
          }
        }
      }))
    }
  }

  const removeArrayItem = (field: string, index: number) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as any[]).filter((_, i) => i !== index)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof typeof prev],
          [keys[1]]: {
            ...prev[keys[0] as keyof typeof prev][keys[1] as keyof any],
            [keys[2]]: (prev[keys[0] as keyof typeof prev][keys[1] as keyof any][keys[2] as keyof any] as any[]).filter((_, i) => i !== index)
          }
        }
      }))
    }
  }

  const updateArrayItem = (field: string, index: number, value: string) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => {
        const newArray = [...prev[field as keyof typeof prev] as any[]]
        newArray[index] = value
        return { ...prev, [field]: newArray }
      })
    } else {
      setFormData(prev => {
        const newArray = [...prev[keys[0] as keyof typeof prev][keys[1] as keyof any][keys[2] as keyof any] as any[]]
        newArray[index] = value
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev],
            [keys[1]]: {
              ...prev[keys[0] as keyof typeof prev][keys[1] as keyof any],
              [keys[2]]: newArray
            }
          }
        }
      })
    }
  }

  const addCustomQuestion = () => {
    setFormData(prev => ({
      ...prev,
      applicationQuestions: [
        ...prev.applicationQuestions,
        { question: '', type: 'text', required: true }
      ]
    }))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      applicationQuestions: prev.applicationQuestions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeQuestion = (index: number) => {
    if (formData.applicationQuestions.length > 1) {
      setFormData(prev => ({
        ...prev,
        applicationQuestions: prev.applicationQuestions.filter((_, i) => i !== index)
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.budget.amount
      case 2:
        return formData.applicationDeadline
      case 3:
        return formData.maxApplicants
      case 4:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Convert form data to API format
      const opportunityData = {
        ...formData,
        budget: {
          ...formData.budget,
          amount: parseFloat(formData.budget.amount) || 0
        },
        maxApplicants: parseInt(formData.maxApplicants) || 100,
        eligibility: {
          ...formData.eligibility,
          minAge: formData.eligibility.minAge ? parseInt(formData.eligibility.minAge) : undefined,
          maxAge: formData.eligibility.maxAge ? parseInt(formData.eligibility.maxAge) : undefined,
          gpaRequirement: formData.eligibility.gpaRequirement ? parseFloat(formData.eligibility.gpaRequirement) : undefined,
          location: {
            countries: formData.eligibility.location.countries.filter(c => c.trim()),
            states: formData.eligibility.location.states.filter(s => s.trim()),
            cities: formData.eligibility.location.cities.filter(c => c.trim())
          },
          subjects: formData.eligibility.subjects.filter(s => s.trim()),
          otherCriteria: formData.eligibility.otherCriteria.filter(c => c.trim())
        },
        requiredDocuments: formData.requiredDocuments.filter(d => d.trim()),
        applicationQuestions: formData.applicationQuestions.filter(q => q.question.trim())
      }

      await onSubmit(opportunityData)
      
      // Reset form
      setFormData({
        title: '', description: '', type: 'scholarship', category: 'Technology',
        budget: { amount: '', currency: 'USD', type: 'fixed' },
        applicationDeadline: '', selectionDate: '', maxApplicants: '',
        eligibility: {
          minAge: '', maxAge: '', educationLevel: ['Any Level'],
          location: { countries: [''], states: [''], cities: [''] },
          gpaRequirement: '', subjects: [''], otherCriteria: ['']
        },
        requiredDocuments: ['Resume/CV'],
        applicationQuestions: [
          { question: 'Why are you interested in this opportunity?', type: 'essay', required: true },
          { question: 'What are your career goals?', type: 'essay', required: true },
          { question: 'How will this opportunity help you?', type: 'essay', required: true }
        ],
        status: 'active', visibility: 'public'
      })
      setCurrentStep(1)
      onClose()
    } catch (error) {
      console.error('Error creating opportunity:', error)
      alert('Error creating opportunity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Create New Opportunity</h2>
                <p className="text-green-100">Share your sponsorship with students worldwide</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-green-200 mb-2">
                <span>Step {currentStep} of 4</span>
                <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                </div>

                {/* Opportunity Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Opportunity Type *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {opportunityTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <label
                          key={type.value}
                          className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.type === type.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="sr-only"
                          />
                          <Icon className="w-6 h-6 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-900">{type.label}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Tech Scholarship for Women in STEM"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the opportunity, its purpose, and what you hope to achieve..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
                </div>

                {/* Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount *</label>
                    <div className="flex">
                      <select
                        value={formData.budget.currency}
                        onChange={(e) => handleInputChange('budget.currency', e.target.value)}
                        className="px-3 py-3 border border-gray-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-gray-900"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                      <input
                        type="number"
                        value={formData.budget.amount}
                        onChange={(e) => handleInputChange('budget.amount', e.target.value)}
                        placeholder="5000"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Timeline & Deadlines */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <CalendarIcon className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Timeline & Deadlines</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
                    <input
                      type="datetime-local"
                      value={formData.applicationDeadline}
                      onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selection Date</label>
                    <input
                      type="date"
                      value={formData.selectionDate}
                      onChange={(e) => handleInputChange('selectionDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Applicants *</label>
                  <input
                    type="number"
                    value={formData.maxApplicants}
                    onChange={(e) => handleInputChange('maxApplicants', e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    min="1"
                    max="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many students can apply for this opportunity?</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Eligibility Criteria */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <UserGroupIcon className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Eligibility Criteria</h3>
                </div>

                {/* Age Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Age</label>
                    <input
                      type="number"
                      value={formData.eligibility.minAge}
                      onChange={(e) => handleInputChange('eligibility.minAge', e.target.value)}
                      placeholder="16"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Age</label>
                    <input
                      type="number"
                      value={formData.eligibility.maxAge}
                      onChange={(e) => handleInputChange('eligibility.maxAge', e.target.value)}
                      placeholder="35"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {educationLevels.map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.eligibility.educationLevel.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('eligibility.educationLevel', [...formData.eligibility.educationLevel, level])
                            } else {
                              handleInputChange('eligibility.educationLevel', formData.eligibility.educationLevel.filter(l => l !== level))
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* GPA Requirement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum GPA Requirement</label>
                  <input
                    type="number"
                    value={formData.eligibility.gpaRequirement}
                    onChange={(e) => handleInputChange('eligibility.gpaRequirement', e.target.value)}
                    placeholder="3.0"
                    step="0.1"
                    min="0"
                    max="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">On a 4.0 scale (leave empty if not required)</p>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Requirements</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.eligibility.location.countries[0] || ''}
                      onChange={(e) => updateArrayItem('eligibility.location.countries', 0, e.target.value)}
                      placeholder="Countries (e.g., United States, Canada)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                    <input
                      type="text"
                      value={formData.eligibility.location.states[0] || ''}
                      onChange={(e) => updateArrayItem('eligibility.location.states', 0, e.target.value)}
                      placeholder="States/Regions (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Application Requirements */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <ClockIcon className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Application Requirements</h3>
                </div>

                {/* Required Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                  <div className="space-y-2">
                    {formData.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={doc}
                          onChange={(e) => updateArrayItem('requiredDocuments', index, e.target.value)}
                          placeholder="Document name"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {formData.requiredDocuments.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('requiredDocuments', index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('requiredDocuments', '')}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      + Add Document
                    </button>
                  </div>
                </div>

                {/* Application Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Questions</label>
                  <div className="space-y-4">
                    {formData.applicationQuestions.map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                          {formData.applicationQuestions.length > 1 && (
                            <button
                              onClick={() => removeQuestion(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          placeholder="Enter your question"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                        />
                        <div className="flex items-center space-x-4">
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          >
                            <option value="text">Short Answer</option>
                            <option value="essay">Essay</option>
                            <option value="multiple-choice">Multiple Choice</option>
                          </select>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Required</span>
                          </label>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addCustomQuestion}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Opportunity'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
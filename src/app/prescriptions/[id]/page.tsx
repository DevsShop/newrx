"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  User, 
  Calendar, 
  Pill, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowLeft,
  Edit,
  Printer
} from "lucide-react"
import { useParams } from "next/navigation"

interface Prescription {
  id: string
  patient: {
    id: string
    user: {
      name: string
      email: string
    }
  }
  doctor: {
    user: {
      name: string
    }
  }
  status: string
  diagnosis?: string
  notes?: string
  issuedAt: string
  expiresAt?: string
  items: Array<{
    id: string
    medication: {
      name: string
      strength: string
    }
    dosage: string
    frequency: string
    duration: string
    quantity: number
    instructions?: string
  }>
}

export default function PrescriptionDetailPage() {
  const params = useParams()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  const fetchPrescription = async () => {
    try {
      const response = await fetch(`/api/prescriptions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPrescription(data.prescription)
      } else {
        setError('Prescription not found')
      }
    } catch (error) {
      console.error('Error fetching prescription:', error)
      setError('Failed to load prescription')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ISSUED": return "bg-blue-100 text-blue-800"
      case "FILLED": return "bg-green-100 text-green-800"
      case "DRAFT": return "bg-yellow-100 text-yellow-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ISSUED": return <Clock className="h-4 w-4" />
      case "FILLED": return <CheckCircle className="h-4 w-4" />
      case "DRAFT": return <FileText className="h-4 w-4" />
      case "CANCELLED": return <XCircle className="h-4 w-4" />
      case "EXPIRED": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const printPrescription = () => {
    if (!prescription) return

    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px; color: #333;">MEDICAL PRESCRIPTION</h1>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">MediCare Pro - Prescription Management System</p>
        </div>
        
        <div style="border: 2px solid #333; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold;">PATIENT INFORMATION</h3>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Name:</strong> ${prescription.patient.user.name}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Email:</strong> ${prescription.patient.user.email}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 2px 0; font-size: 14px;"><strong>Date:</strong> ${formatDate(prescription.issuedAt)}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Prescription ID:</strong> ${prescription.id}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Status:</strong> ${prescription.status}</p>
              ${prescription.expiresAt ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Expires:</strong> ${formatDate(prescription.expiresAt)}</p>` : ''}
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">DOCTOR INFORMATION</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ${prescription.doctor.user.name}</p>
          </div>
          
          ${prescription.diagnosis ? `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">DIAGNOSIS</h3>
            <p style="margin: 5px 0; font-size: 14px;">${prescription.diagnosis}</p>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">MEDICATIONS</h3>
            ${prescription.items.map((item, index) => `
              <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; font-weight: bold;">${index + 1}. ${item.medication.name}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Dosage:</strong> ${item.dosage}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Quantity:</strong> ${item.quantity}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Frequency:</strong> ${item.frequency}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Duration:</strong> ${item.duration}</p>
                ${item.instructions ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Instructions:</strong> ${item.instructions}</p>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${prescription.notes ? `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">ADDITIONAL NOTES</h3>
            <p style="margin: 5px 0; font-size: 14px;">${prescription.notes}</p>
          </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
          <p style="margin: 0; font-size: 12px; color: #666;">Generated by MediCare Pro - ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription - ${prescription.patient.user.name}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading prescription...</p>
        </div>
      </div>
    )
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Prescription Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'The prescription you are looking for does not exist.'}</p>
          <Button onClick={() => window.location.href = '/prescriptions'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prescriptions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">Prescription Details</h1>
                <p className="text-sm text-gray-500">View prescription information</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/prescriptions'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Prescriptions
              </Button>
              <Button variant="outline" onClick={printPrescription}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => window.location.href = `/prescriptions/${prescription.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prescription Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient & Doctor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Prescription Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Patient Information
                    </h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {prescription.patient.user.name}</p>
                      <p><span className="font-medium">Email:</span> {prescription.patient.user.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Doctor Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> Dr. {prescription.doctor.user.name}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge className={getStatusColor(prescription.status)}>
                        {getStatusIcon(prescription.status)}
                        <span className="ml-1">{prescription.status}</span>
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Issued Date</p>
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(prescription.issuedAt)}
                      </p>
                    </div>
                    {prescription.expiresAt && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expires</p>
                        <p className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(prescription.expiresAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{prescription.diagnosis}</p>
                </CardContent>
              </Card>
            )}

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Medications
                </CardTitle>
                <CardDescription>Prescribed medications and dosage instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescription.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {index + 1}. {item.medication.name}
                        </h4>
                        <Badge variant="outline">
                          {item.medication.strength}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Dosage:</span>
                          <p className="text-gray-700">{item.dosage}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Frequency:</span>
                          <p className="text-gray-700">{item.frequency}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Duration:</span>
                          <p className="text-gray-700">{item.duration}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Quantity:</span>
                          <p className="text-gray-700">{item.quantity}</p>
                        </div>
                      </div>
                      {item.instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="font-medium text-gray-500">Instructions:</span>
                          <p className="text-gray-700 mt-1">{item.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {prescription.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{prescription.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={printPrescription}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Prescription
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = `/prescriptions/${prescription.id}/edit`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Prescription
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/prescriptions'}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>
              </CardContent>
            </Card>

            {/* Prescription Info */}
            <Card>
              <CardHeader>
                <CardTitle>Prescription Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Prescription ID</p>
                  <p className="text-sm font-mono text-gray-700">{prescription.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Medications</p>
                  <p className="text-sm text-gray-700">{prescription.items.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(prescription.status)}>
                    {getStatusIcon(prescription.status)}
                    <span className="ml-1">{prescription.status}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
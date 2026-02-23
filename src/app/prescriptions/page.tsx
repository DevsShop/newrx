"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  User,
  Calendar,
  Pill,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

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
  }>
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions)
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
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

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const printPrescription = (prescription: Prescription) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
                <h1 className="text-xl font-semibold text-gray-900">Prescriptions</h1>
                <p className="text-sm text-gray-500">Manage patient prescriptions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← Back to Dashboard
              </Button>
              <Button onClick={() => window.location.href = '/prescriptions/create'}>
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by patient, doctor, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "DRAFT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("DRAFT")}
                >
                  Draft
                </Button>
                <Button
                  variant={statusFilter === "ISSUED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("ISSUED")}
                >
                  Issued
                </Button>
                <Button
                  variant={statusFilter === "FILLED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("FILLED")}
                >
                  Filled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions List</CardTitle>
            <CardDescription>
              {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading prescriptions...</p>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters or search terms." 
                    : "Get started by creating your first prescription."
                  }
                </p>
                <Button onClick={() => window.location.href = '/prescriptions/create'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-gray-400" />
                              <h3 className="font-medium text-gray-900">
                                {prescription.patient.user.name}
                              </h3>
                            </div>
                            <Badge className={getStatusColor(prescription.status)}>
                              {getStatusIcon(prescription.status)}
                              <span className="ml-1">{prescription.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(prescription.issuedAt)}</span>
                            </div>
                            {prescription.expiresAt && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Expires: {formatDate(prescription.expiresAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Doctor */}
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Doctor:</span> {prescription.doctor.user.name}
                          </p>
                        </div>

                        {/* Diagnosis */}
                        {prescription.diagnosis && (
                          <div className="mb-3">
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Diagnosis:</span> {prescription.diagnosis}
                            </p>
                          </div>
                        )}

                        {/* Medications */}
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Pill className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Medications:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {prescription.items.map((item, index) => (
                              <Badge key={item.id} variant="outline" className="text-xs">
                                {item.medication.name} ({item.dosage})
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {prescription.notes && (
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => printPrescription(prescription)}>
                          🖨️ Print
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
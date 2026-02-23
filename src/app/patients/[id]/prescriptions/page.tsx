"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  FileText,
  Calendar,
  User,
  Filter
} from "lucide-react"

interface Patient {
  id: string
  name: string
  email: string
  age?: number
  phone?: string
}

interface Prescription {
  id: string
  status: string
  diagnosis?: string
  notes?: string
  issuedAt: string
  expiresAt?: string
  doctor: {
    user: {
      name: string
    }
  }
  items: Array<{
    id: string
    medication: {
      name: string
      strength: string
      dosageForm: string
    }
    dosage: string
    frequency: string
    duration: string
    quantity: number
  }>
}

export default function PatientPrescriptionsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchPatientData()
  }, [patientId])

  const fetchPatientData = async () => {
    setLoading(true)
    try {
      // Fetch patient details
      const patientResponse = await fetch(`/api/patients/${patientId}`)
      if (patientResponse.ok) {
        const patientData = await patientResponse.json()
        setPatient({
          id: patientData.id,
          name: patientData.name,
          email: patientData.email,
          age: patientData.age,
          phone: patientData.phone
        })
        setPrescriptions(patientData.prescriptions)
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      case "ISSUED": return <Calendar className="h-4 w-4" />
      case "FILLED": return <FileText className="h-4 w-4" />
      case "DRAFT": return <FileText className="h-4 w-4" />
      case "CANCELLED": return <FileText className="h-4 w-4" />
      case "EXPIRED": return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = !searchTerm || 
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.items.some(item => 
        item.medication.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const viewPrescription = (prescriptionId: string) => {
    router.push(`/prescriptions/${prescriptionId}`)
  }

  const editPrescription = (prescriptionId: string) => {
    router.push(`/prescriptions/${prescriptionId}/edit`)
  }

  const createNewPrescription = () => {
    router.push(`/prescriptions/create?patientId=${patientId}`)
  }

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
              <p style="margin: 2px 0; font-size: 14px;"><strong>Name:</strong> ${patient?.name}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Email:</strong> ${patient?.email}</p>
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
          <title>Prescription - ${patient?.name}</title>
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
          <p className="mt-2 text-gray-500">Loading patient prescriptions...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-500 mb-4">The patient you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push(`/patients/${patientId}`)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Patient Prescriptions</h1>
                <p className="text-sm text-gray-500">{patient.name}</p>
              </div>
            </div>
            <Button onClick={createNewPrescription}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by diagnosis, doctor, or medication..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ISSUED">Issued</option>
                  <option value="FILLED">Filled</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </p>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "No prescriptions match your search criteria."
                    : "This patient doesn't have any prescriptions yet."
                  }
                </p>
                <Button onClick={createNewPrescription}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Prescription
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {prescription.diagnosis || "No diagnosis provided"}
                      </CardTitle>
                      <CardDescription>
                        Dr. {prescription.doctor.user.name} • {formatDate(prescription.issuedAt)}
                        {prescription.expiresAt && ` • Expires: ${formatDate(prescription.expiresAt)}`}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>
                      {getStatusIcon(prescription.status)}
                      <span className="ml-1">{prescription.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Medications */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Medications ({prescription.items.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {prescription.items.slice(0, 5).map((item) => (
                          <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.medication.name} ({item.dosage})
                          </span>
                        ))}
                        {prescription.items.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{prescription.items.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600">{prescription.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => printPrescription(prescription)}
                        title="Print Prescription"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewPrescription(prescription.id)}
                        title="View Prescription Details"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editPrescription(prescription.id)}
                        title="Edit Prescription"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
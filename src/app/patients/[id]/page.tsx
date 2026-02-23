"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Edit,
  Eye,
  Plus,
  Activity,
  Heart,
  Droplet
} from "lucide-react"

interface Patient {
  id: string
  name: string
  email: string
  dateOfBirth?: string
  age?: number
  phone?: string
  address?: string
  bloodType?: string
  allergies?: string
  createdAt: string
  visitCount: number
  lastVisit?: string
  prescriptions: Array<{
    id: string
    status: string
    diagnosis?: string
    issuedAt: string
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
    }>
  }>
  appointments: Array<{
    id: string
    title: string
    date: string
    status: string
    doctor: {
      user: {
        name: string
      }
    }
  }>
  medicalRecords: Array<{
    id: string
    title: string
    diagnosis?: string
    treatment?: string
    recordDate: string
    doctor: {
      user: {
        name: string
      }
    }
  }>
}

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchPatientDetails()
  }, [patientId])

  const fetchPatientDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data)
      } else {
        console.error('Failed to fetch patient details')
      }
    } catch (error) {
      console.error('Error fetching patient details:', error)
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
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const viewPrescription = (prescriptionId: string) => {
    router.push(`/prescriptions/${prescriptionId}`)
  }

  const editPrescription = (prescriptionId: string) => {
    router.push(`/prescriptions/${prescriptionId}/edit`)
  }

  const createNewPrescription = () => {
    router.push(`/prescriptions/create?patientId=${patientId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading patient details...</p>
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
                onClick={() => router.push('/')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Patient Details</h1>
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
        {/* Patient Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <CardDescription>Patient since {formatDate(patient.createdAt)}</CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {patient.visitCount} {patient.visitCount === 1 ? 'visit' : 'visits'}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Patient
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{patient.age || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{patient.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium truncate">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Visit</p>
                  <p className="font-medium">{patient.lastVisit ? formatDate(patient.lastVisit) : 'No visits yet'}</p>
                </div>
              </div>
            </div>
            
            {patient.address && (
              <div className="mt-4 flex items-start space-x-2">
                <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.bloodType && (
                <div className="flex items-center space-x-2">
                  <Droplet className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium">{patient.bloodType}</p>
                  </div>
                </div>
              )}
              {patient.allergies && (
                <div className="flex items-start space-x-2">
                  <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Allergies</p>
                    <p className="font-medium">{patient.allergies}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "prescriptions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Prescriptions ({patient.prescriptions.length})
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "appointments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Appointments ({patient.appointments.length})
              </button>
              <button
                onClick={() => setActiveTab("medical-records")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "medical-records"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Medical Records ({patient.medicalRecords.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{patient.prescriptions.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{patient.appointments.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{patient.medicalRecords.length}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {patient.prescriptions.slice(0, 3).map((prescription) => (
                      <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Prescription - {prescription.diagnosis || 'No diagnosis'}</p>
                            <p className="text-sm text-gray-500">Dr. {prescription.doctor.user.name} • {formatDate(prescription.issuedAt)}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                    ))}
                    {patient.prescriptions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                {patient.prescriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions</h3>
                    <p className="text-gray-500 mb-4">This patient doesn't have any prescriptions yet.</p>
                    <Button onClick={createNewPrescription}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Prescription
                    </Button>
                  </div>
                ) : (
                  patient.prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {prescription.diagnosis || 'No diagnosis provided'}
                            </CardTitle>
                            <CardDescription>
                              Dr. {prescription.doctor.user.name} • {formatDate(prescription.issuedAt)}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Medications:</h4>
                            <div className="space-y-1">
                              {prescription.items.map((item, index) => (
                                <div key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                                  <span className="font-medium">{item.medication.name}</span> - {item.dosage}, {item.frequency}, {item.duration}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewPrescription(prescription.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => editPrescription(prescription.id)}
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
            )}

            {activeTab === "appointments" && (
              <div className="space-y-4">
                {patient.appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                    <p className="text-gray-500">This patient doesn't have any appointments scheduled.</p>
                  </div>
                ) : (
                  patient.appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{appointment.title}</CardTitle>
                            <CardDescription>
                              Dr. {appointment.doctor.user.name} • {formatDate(appointment.date)}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === "medical-records" && (
              <div className="space-y-4">
                {patient.medicalRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
                    <p className="text-gray-500">This patient doesn't have any medical records yet.</p>
                  </div>
                ) : (
                  patient.medicalRecords.map((record) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{record.title}</CardTitle>
                            <CardDescription>
                              Dr. {record.doctor.user.name} • {formatDate(record.recordDate)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {record.diagnosis && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Diagnosis:</h4>
                              <p className="text-sm">{record.diagnosis}</p>
                            </div>
                          )}
                          {record.treatment && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Treatment:</h4>
                              <p className="text-sm">{record.treatment}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
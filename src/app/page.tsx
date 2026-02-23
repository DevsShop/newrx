"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  FileText, 
  Pill, 
  Calendar, 
  Bell, 
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
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
    issuedAt: string
    doctor: {
      user: {
        name: string
      }
    }
  }>
}

interface Medication {
  id: string
  name: string
  description?: string
  category?: string
  dosageForm?: string
  strength?: string
  manufacturer?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  usageStats: {
    totalPrescriptions: number
    activePrescriptions: number
    lastUsed?: string
  }
}

interface Appointment {
  id: string
  title: string
  description?: string
  date: string
  status: string
  patient: {
    id: string
    user: {
      name: string
      email: string
    }
  }
  doctor: {
    id: string
    user: {
      name: string
      email: string
    }
  }
  createdAt: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([])
  const [activePrescriptions, setActivePrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false)
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [medicationsLoading, setMedicationsLoading] = useState(false)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [medicationSearchTerm, setMedicationSearchTerm] = useState("")
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchRecentPrescriptions()
      fetchActivePrescriptions() // Also fetch active prescriptions for the dashboard count
      fetchPatients() // Also fetch patients for the dashboard count
      fetchAppointments() // Also fetch appointments for the dashboard count
    } else if (activeTab === "prescriptions") {
      fetchActivePrescriptions()
    } else if (activeTab === "patients") {
      fetchPatients()
    } else if (activeTab === "medications") {
      fetchMedications()
    } else if (activeTab === "appointments") {
      fetchAppointments()
    }
  }, [activeTab])

  // Initial fetch for active prescriptions, patients, medications, and appointments
  useEffect(() => {
    fetchActivePrescriptions()
    fetchPatients()
    fetchMedications()
    fetchAppointments()
  }, [])

  const fetchPatients = async (search = "") => {
    setPatientsLoading(true)
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(search)}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched patients:', data.patients)
        setPatients(data.patients)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setPatientsLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    fetchPatients(term)
  }

  const fetchMedications = async (search = "", category = "") => {
    setMedicationsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      
      const response = await fetch(`/api/medications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMedications(data.medications)
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setMedicationsLoading(false)
    }
  }

  const fetchAppointments = async (search = "", status = "") => {
    setAppointmentsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      
      const response = await fetch(`/api/appointments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const handleMedicationSearch = (term: string) => {
    setMedicationSearchTerm(term)
    fetchMedications(term, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    fetchMedications(medicationSearchTerm, category)
  }

  const handleAppointmentSearch = (term: string) => {
    setAppointmentSearchTerm(term)
    fetchAppointments(term, selectedStatus)
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    fetchAppointments(appointmentSearchTerm, status)
  }

  const fetchRecentPrescriptions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        // Get only the 5 most recent prescriptions
        setRecentPrescriptions(data.prescriptions.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching recent prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivePrescriptions = async () => {
    setPrescriptionsLoading(true)
    try {
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        // Filter for active prescriptions (DRAFT, ISSUED or FILLED status)
        const active = data.prescriptions.filter((p: Prescription) => 
          p.status === 'DRAFT' || p.status === 'ISSUED' || p.status === 'FILLED'
        )
        setActivePrescriptions(active)
      }
    } catch (error) {
      console.error('Error fetching active prescriptions:', error)
    } finally {
      setPrescriptionsLoading(false)
    }
  }

  const viewPrescription = (prescriptionId: string) => {
    window.location.href = `/prescriptions/${prescriptionId}`
  }

  const editPrescription = (prescriptionId: string) => {
    window.location.href = `/prescriptions/${prescriptionId}/edit`
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ISSUED": return "bg-blue-100 text-blue-800"
      case "FILLED": return "bg-green-100 text-green-800"
      case "DRAFT": return "bg-yellow-100 text-yellow-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      case "EXPIRED": return "bg-gray-100 text-gray-800"
      case "SCHEDULED": return "bg-blue-100 text-blue-800"
      case "COMPLETED": return "bg-green-100 text-green-800"
      case "NO_SHOW": return "bg-red-100 text-red-800"
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

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null
    return Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const viewPatientDetails = (patientId: string) => {
    window.location.href = `/patients/${patientId}`
  }

  const viewPatientPrescriptions = (patientId: string) => {
    window.location.href = `/patients/${patientId}/prescriptions`
  }

  const viewMedicationDetails = (medicationId: string) => {
    window.location.href = `/medications/${medicationId}`
  }

  const editMedication = (medicationId: string) => {
    window.location.href = `/medications/${medicationId}/edit`
  }

  const viewAppointmentDetails = (appointmentId: string) => {
    window.location.href = `/appointments/${appointmentId}`
  }

  const editAppointment = (appointmentId: string) => {
    window.location.href = `/appointments/${appointmentId}/edit`
  }

  const createNewAppointment = () => {
    window.location.href = '/appointments/create'
  }

  const upcomingAppointments = [
    {
      id: "1",
      patientName: "Alice Brown",
      doctorName: "Dr. Sarah Smith",
      date: "2024-01-16",
      time: "10:00 AM",
      status: "SCHEDULED"
    },
    {
      id: "2",
      patientName: "Charlie Wilson",
      doctorName: "Dr. Michael Johnson", 
      date: "2024-01-16",
      time: "2:30 PM",
      status: "SCHEDULED"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">MediCare Pro</h1>
                <p className="text-sm text-gray-500">Prescription Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients, prescriptions..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patients.length}</div>
                  <p className="text-xs text-muted-foreground">Registered patients</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activePrescriptions.length}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Medications</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{medications.length}</div>
                  <p className="text-xs text-muted-foreground">In database</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments.filter(apt => {
                      const aptDate = new Date(apt.date).toDateString()
                      const today = new Date().toDateString()
                      return aptDate === today
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Scheduled today</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Prescriptions</CardTitle>
                      <CardDescription>Latest prescription activity</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchRecentPrescriptions}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading prescriptions...</p>
                      </div>
                    ) : recentPrescriptions.length === 0 ? (
                      <div className="text-center py-4">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No prescriptions found</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => window.location.href = '/prescriptions/create'}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Prescription
                        </Button>
                      </div>
                    ) : (
                      recentPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{prescription.patient.user.name}</h4>
                              <Badge className={getStatusColor(prescription.status)}>
                                {getStatusIcon(prescription.status)}
                                <span className="ml-1">{prescription.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">Dr. {prescription.doctor.user.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(prescription.issuedAt)}</p>
                            {prescription.diagnosis && (
                              <p className="text-xs text-gray-600 mt-1">Diagnosis: {prescription.diagnosis}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => printPrescription(prescription)}
                              title="Print Prescription"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => editPrescription(prescription.id)}
                              title="Edit Prescription"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Today's scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{appointment.patientName}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Dr. {appointment.doctorName}</p>
                          <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patients</CardTitle>
                    <CardDescription>Manage patient records and information</CardDescription>
                  </div>
                  <Button onClick={() => window.location.href = '/patients/create'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search patients by name, email, or phone..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Patients List */}
                <div className="space-y-4">
                  {patientsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading patients...</p>
                    </div>
                  ) : patients.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm 
                          ? `No patients found matching "${searchTerm}"`
                          : "There are no patients in the system yet."
                        }
                      </p>
                      <Button onClick={() => window.location.href = '/patients/create'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Patient
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {patients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{patient.name}</CardTitle>
                              <Badge variant="secondary">
                                {patient.visitCount} {patient.visitCount === 1 ? 'visit' : 'visits'}
                              </Badge>
                            </div>
                            <CardDescription className="text-sm">
                              Patient since {formatDate(patient.createdAt)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Age:</span>
                                <span className="ml-2">{patient.age || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Phone:</span>
                                <span className="ml-2">{patient.phone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Email:</span>
                                <span className="ml-2 truncate">{patient.email}</span>
                              </div>
                              {patient.lastVisit && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Last visit:</span>
                                  <span className="ml-2">{formatDate(patient.lastVisit)}</span>
                                </div>
                              )}
                              {patient.bloodType && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Blood type:</span>
                                  <span className="ml-2">{patient.bloodType}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => viewPatientDetails(patient.id)}
                                title="View Patient Details"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => viewPatientPrescriptions(patient.id)}
                                title="View Patient Prescriptions"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Prescriptions
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Prescriptions</CardTitle>
                    <CardDescription>Manage current prescriptions</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchActivePrescriptions}
                      disabled={prescriptionsLoading}
                    >
                      {prescriptionsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                    <Button onClick={() => window.location.href = '/prescriptions/create'}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Prescription
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading active prescriptions...</p>
                    </div>
                  ) : activePrescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Prescriptions</h3>
                      <p className="text-gray-500 mb-4">
                        There are currently no active prescriptions in the system.
                      </p>
                      <Button onClick={() => window.location.href = '/prescriptions/create'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Prescription
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activePrescriptions.map((prescription) => (
                        <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-lg">{prescription.patient.user.name}</h4>
                              <Badge className={getStatusColor(prescription.status)}>
                                {getStatusIcon(prescription.status)}
                                <span className="ml-1">{prescription.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Dr. {prescription.doctor.user.name}</p>
                            <p className="text-xs text-gray-500 mb-2">Issued: {formatDate(prescription.issuedAt)}</p>
                            {prescription.expiresAt && (
                              <p className="text-xs text-gray-500 mb-2">Expires: {formatDate(prescription.expiresAt)}</p>
                            )}
                            {prescription.diagnosis && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                              </p>
                            )}
                            {prescription.items.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 font-medium mb-1">Medications:</p>
                                <div className="flex flex-wrap gap-1">
                                  {prescription.items.slice(0, 3).map((item, index) => (
                                    <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {item.medication.name} ({item.dosage})
                                    </span>
                                  ))}
                                  {prescription.items.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{prescription.items.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => printPrescription(prescription)}
                              title="Print Prescription"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => editPrescription(prescription.id)}
                              title="Edit Prescription"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medications</CardTitle>
                    <CardDescription>Manage medication database and track usage</CardDescription>
                  </div>
                  <Button onClick={() => window.location.href = '/medications/create'}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search medications by name, description, or manufacturer..."
                      className="pl-10"
                      value={medicationSearchTerm}
                      onChange={(e) => handleMedicationSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Category:</span>
                    <select
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      value={selectedCategory}
                      onChange={(e) => handleCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Pain Relievers">Pain Relievers</option>
                      <option value="Vitamins">Vitamins</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Respiratory">Respiratory</option>
                    </select>
                  </div>
                </div>

                {/* Medications List */}
                <div className="space-y-4">
                  {medicationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading medications...</p>
                    </div>
                  ) : medications.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Medications Found</h3>
                      <p className="text-gray-500 mb-4">
                        {medicationSearchTerm || selectedCategory
                          ? "No medications match your search criteria."
                          : "There are no medications in the database yet."
                        }
                      </p>
                      <Button onClick={() => window.location.href = '/medications/create'}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Medication
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {medications.map((medication) => (
                        <Card key={medication.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{medication.name}</CardTitle>
                              <div className="flex items-center space-x-2">
                                {medication.strength && (
                                  <Badge variant="outline" className="text-xs">
                                    {medication.strength}
                                  </Badge>
                                )}
                                <Badge variant={medication.isActive ? "default" : "secondary"}>
                                  {medication.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            {medication.category && (
                              <CardDescription className="text-sm">
                                {medication.category} • {medication.dosageForm || 'N/A'}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {medication.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {medication.description}
                                </p>
                              )}
                              
                              {medication.manufacturer && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Manufacturer:</span> {medication.manufacturer}
                                </div>
                              )}

                              {/* Usage Statistics */}
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="font-medium">Total Rx:</span>
                                    <div className="text-lg font-bold text-blue-600">
                                      {medication.usageStats.totalPrescriptions}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Active:</span>
                                    <div className="text-lg font-bold text-green-600">
                                      {medication.usageStats.activePrescriptions}
                                    </div>
                                  </div>
                                </div>
                                {medication.usageStats.lastUsed && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Last used: {formatDate(medication.usageStats.lastUsed)}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => viewMedicationDetails(medication.id)}
                                title="View Medication Details"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => editMedication(medication.id)}
                                title="Edit Medication"
                              >
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Manage patient appointments and scheduling</CardDescription>
                  </div>
                  <Button onClick={createNewAppointment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search appointments by title, patient, or doctor..."
                      className="pl-10"
                      value={appointmentSearchTerm}
                      onChange={(e) => handleAppointmentSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status:</span>
                    <select
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                      value={selectedStatus}
                      onChange={(e) => handleStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="NO_SHOW">No Show</option>
                    </select>
                  </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-4">
                  {appointmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading appointments...</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
                      <p className="text-gray-500 mb-4">
                        {appointmentSearchTerm || selectedStatus
                          ? "No appointments match your search criteria."
                          : "There are no appointments scheduled yet."
                        }
                      </p>
                      <Button onClick={createNewAppointment}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule First Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Group appointments by date */}
                      {Object.entries(
                        appointments.reduce((groups, appointment) => {
                          const date = new Date(appointment.date).toDateString()
                          if (!groups[date]) {
                            groups[date] = []
                          }
                          groups[date].push(appointment)
                          return groups
                        }, {} as Record<string, typeof appointments>)
                      ).map(([dateStr, dayAppointments]) => {
                        const date = new Date(dateStr)
                        const isToday = date.toDateString() === new Date().toDateString()
                        const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString()
                        
                        return (
                          <div key={dateStr}>
                            <div className="flex items-center mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatDate(dateStr)}
                              </h3>
                              {isToday && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800">
                                  Today
                                </Badge>
                              )}
                              <span className="ml-2 text-sm text-gray-500">
                                ({dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''})
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {dayAppointments.map((appointment) => {
                                const appointmentTime = new Date(appointment.date)
                                const hours = appointmentTime.getHours()
                                const minutes = appointmentTime.getMinutes()
                                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                                
                                return (
                                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{appointment.title}</CardTitle>
                                        <Badge className={getStatusColor(appointment.status)}>
                                          {appointment.status}
                                        </Badge>
                                      </div>
                                      <CardDescription className="text-sm">
                                        {timeString} • Dr. {appointment.doctor.user.name}
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                      <div className="space-y-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                          <span className="font-medium">Patient:</span>
                                          <span className="ml-2">{appointment.patient.user.name}</span>
                                        </div>
                                        
                                        {appointment.description && (
                                          <p className="text-sm text-gray-600 line-clamp-2">
                                            {appointment.description}
                                          </p>
                                        )}
                                        
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>Scheduled: {formatDate(appointment.date)}</span>
                                          <span>{timeString}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-2 mt-4">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1"
                                          onClick={() => viewAppointmentDetails(appointment.id)}
                                          title="View Appointment Details"
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="flex-1"
                                          onClick={() => editAppointment(appointment.id)}
                                          title="Edit Appointment"
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
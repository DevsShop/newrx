"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  Save, 
  User, 
  Calendar, 
  Stethoscope,
  Pill,
  FileText,
  AlertCircle,
  Clock,
  ArrowLeft
} from "lucide-react"
import { useParams } from "next/navigation"

interface MedicationItem {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: number
}

interface ComplaintItem {
  id: string
  symptom: string
  duration: string
  severity: string
  description: string
}

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

export default function EditPrescriptionPage() {
  const params = useParams()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
    address: ""
  })

  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [newComplaint, setNewComplaint] = useState({
    symptom: "",
    duration: "",
    severity: "Mild",
    description: ""
  })

  const [medications, setMedications] = useState<MedicationItem[]>([])
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    quantity: 1
  })

  const [prescriptionDetails, setPrescriptionDetails] = useState({
    diagnosis: "",
    notes: "",
    followUp: "",
    status: "ISSUED"
  })

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  const fetchPrescription = async () => {
    try {
      const response = await fetch(`/api/prescriptions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const prescriptionData = data.prescription
        setPrescription(prescriptionData)
        
        // Populate form with existing data
        setPatientInfo({
          name: prescriptionData.patient.user.name,
          email: prescriptionData.patient.user.email,
          age: "",
          gender: "",
          phone: "",
          address: ""
        })

        setPrescriptionDetails({
          diagnosis: prescriptionData.diagnosis || "",
          notes: prescriptionData.notes || "",
          followUp: "",
          status: prescriptionData.status
        })

        // Convert prescription items to medication items
        const medicationItems = prescriptionData.items.map(item => ({
          id: item.id,
          name: item.medication.name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || "",
          quantity: item.quantity
        }))
        setMedications(medicationItems)
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

  const addComplaint = () => {
    if (newComplaint.symptom.trim()) {
      const complaint: ComplaintItem = {
        id: Date.now().toString(),
        ...newComplaint
      }
      setComplaints([...complaints, complaint])
      setNewComplaint({
        symptom: "",
        duration: "",
        severity: "Mild",
        description: ""
      })
    }
  }

  const removeComplaint = (id: string) => {
    setComplaints(complaints.filter(complaint => complaint.id !== id))
  }

  const addMedication = () => {
    if (newMedication.name.trim() && newMedication.dosage.trim()) {
      const medication: MedicationItem = {
        id: Date.now().toString(),
        ...newMedication
      }
      setMedications([...medications, medication])
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        quantity: 1
      })
    }
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter(medication => medication.id !== id))
  }

  const savePrescription = async () => {
    if (!patientInfo.name || medications.length === 0) {
      alert("Please ensure patient name is provided and at least one medication is added")
      return
    }

    setIsSaving(true)
    const prescriptionData = {
      patient: patientInfo,
      complaints,
      medications,
      details: prescriptionDetails,
      updatedAt: new Date().toISOString()
    }

    try {
      const response = await fetch(`/api/prescriptions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Prescription updated successfully!')
        window.location.href = `/prescriptions/${params.id}`
      } else {
        alert(`Failed to update prescription: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating prescription:', error)
      alert('Failed to update prescription. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild": return "bg-green-100 text-green-800"
      case "moderate": return "bg-yellow-100 text-yellow-800"
      case "severe": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
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
                <h1 className="text-xl font-semibold text-gray-900">Edit Prescription</h1>
                <p className="text-sm text-gray-500">Modify prescription for {prescription.patient.user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = `/prescriptions/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={savePrescription} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Patient Information
            </CardTitle>
            <CardDescription>Patient details (read-only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patientName">Full Name</Label>
                <Input
                  id="patientName"
                  value={patientInfo.name}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="patientEmail">Email</Label>
                <Input
                  id="patientEmail"
                  value={patientInfo.email}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="prescriptionStatus">Status</Label>
                <Select value={prescriptionDetails.status} onValueChange={(value) => setPrescriptionDetails({...prescriptionDetails, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ISSUED">Issued</SelectItem>
                    <SelectItem value="FILLED">Filled</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Sidebar - Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Patient Complaints
              </CardTitle>
              <CardDescription>Record patient symptoms and complaints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Complaint Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add New Complaint</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="symptom">Symptom *</Label>
                    <Input
                      id="symptom"
                      value={newComplaint.symptom}
                      onChange={(e) => setNewComplaint({...newComplaint, symptom: e.target.value})}
                      placeholder="e.g., Headache, Fever, Cough"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={newComplaint.duration}
                        onChange={(e) => setNewComplaint({...newComplaint, duration: e.target.value})}
                        placeholder="e.g., 3 days"
                      />
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select value={newComplaint.severity} onValueChange={(value) => setNewComplaint({...newComplaint, severity: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mild">Mild</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                      placeholder="Additional details about the symptom"
                      rows={2}
                    />
                  </div>
                  <Button onClick={addComplaint} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Complaint
                  </Button>
                </div>
              </div>

              {/* Complaints List */}
              <div>
                <h4 className="font-medium mb-3">Current Complaints</h4>
                {complaints.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No complaints added yet</p>
                ) : (
                  <div className="space-y-2">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{complaint.symptom}</h5>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(complaint.severity)}>
                              {complaint.severity}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeComplaint(complaint.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {complaint.duration && (
                          <p className="text-sm text-gray-600 mb-1">Duration: {complaint.duration}</p>
                        )}
                        {complaint.description && (
                          <p className="text-sm text-gray-600">{complaint.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Sidebar - Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Medications
              </CardTitle>
              <CardDescription>Prescribe medications and dosages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Medication Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add New Medication</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="medicationName">Medication Name *</Label>
                      <Input
                        id="medicationName"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                        placeholder="e.g., Amoxicillin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage">Dosage *</Label>
                      <Input
                        id="dosage"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newMedication.quantity}
                        onChange={(e) => setNewMedication({...newMedication, quantity: parseInt(e.target.value) || 1})}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Input
                        id="instructions"
                        value={newMedication.instructions}
                        onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                        placeholder="e.g., Take with food"
                      />
                    </div>
                  </div>
                  <Button onClick={addMedication} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </div>

              {/* Medications List */}
              <div>
                <h4 className="font-medium mb-3">Current Medications</h4>
                {medications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No medications added yet</p>
                ) : (
                  <div className="space-y-2">
                    {medications.map((medication) => (
                      <div key={medication.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{medication.name}</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(medication.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><strong>Dosage:</strong> {medication.dosage}</div>
                          <div><strong>Quantity:</strong> {medication.quantity}</div>
                          {medication.frequency && (
                            <div><strong>Frequency:</strong> {medication.frequency}</div>
                          )}
                          {medication.duration && (
                            <div><strong>Duration:</strong> {medication.duration}</div>
                          )}
                        </div>
                        {medication.instructions && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Instructions:</strong> {medication.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescription Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>Additional prescription information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={prescriptionDetails.diagnosis}
                  onChange={(e) => setPrescriptionDetails({...prescriptionDetails, diagnosis: e.target.value})}
                  placeholder="Enter diagnosis"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={prescriptionDetails.notes}
                  onChange={(e) => setPrescriptionDetails({...prescriptionDetails, notes: e.target.value})}
                  placeholder="Any additional notes or instructions"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="followUp">Follow-up</Label>
                <Input
                  id="followUp"
                  value={prescriptionDetails.followUp}
                  onChange={(e) => setPrescriptionDetails({...prescriptionDetails, followUp: e.target.value})}
                  placeholder="e.g., Follow up in 2 weeks"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
"use client"

import { useState } from "react"
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
  Clock
} from "lucide-react"

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

export default function CreatePrescriptionPage() {
  // Patient Information
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: ""
  })

  // Complaints (Left Sidebar)
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [newComplaint, setNewComplaint] = useState({
    symptom: "",
    duration: "",
    severity: "Mild",
    description: ""
  })

  // Medications (Right Sidebar)
  const [medications, setMedications] = useState<MedicationItem[]>([])
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    quantity: 1
  })

  // Prescription Details
  const [prescriptionDetails, setPrescriptionDetails] = useState({
    diagnosis: "",
    notes: "",
    followUp: ""
  })

  // Saved prescription data for printing
  const [savedPrescription, setSavedPrescription] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Add Complaint
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

  // Remove Complaint
  const removeComplaint = (id: string) => {
    setComplaints(complaints.filter(complaint => complaint.id !== id))
  }

  // Add Medication
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

  // Remove Medication
  const removeMedication = (id: string) => {
    setMedications(medications.filter(medication => medication.id !== id))
  }

  // Save Prescription
  const savePrescription = async () => {
    if (!patientInfo.name || medications.length === 0) {
      alert("Please fill in patient information and add at least one medication")
      return
    }

    setIsSaving(true)
    const prescriptionData = {
      patient: patientInfo,
      complaints,
      medications,
      details: prescriptionDetails,
      createdAt: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      })

      const result = await response.json()

      if (response.ok) {
        // Store the saved prescription data for printing
        setSavedPrescription({
          ...prescriptionData,
          id: result.prescriptionId,
          savedAt: new Date().toISOString()
        })
        alert(`Prescription saved successfully! ID: ${result.prescriptionId}`)
      } else {
        alert(`Failed to save prescription: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving prescription:', error)
      alert('Failed to save prescription. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Print Prescription
  const printPrescription = () => {
    if (!savedPrescription) {
      alert("Please save the prescription first")
      return
    }

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
              <p style="margin: 2px 0; font-size: 14px;"><strong>Name:</strong> ${savedPrescription.patient.name}</p>
              ${savedPrescription.patient.age ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Age:</strong> ${savedPrescription.patient.age}</p>` : ''}
              ${savedPrescription.patient.gender ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Gender:</strong> ${savedPrescription.patient.gender}</p>` : ''}
              ${savedPrescription.patient.phone ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Phone:</strong> ${savedPrescription.patient.phone}</p>` : ''}
              ${savedPrescription.patient.address ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Address:</strong> ${savedPrescription.patient.address}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <p style="margin: 2px 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Prescription ID:</strong> ${savedPrescription.id}</p>
            </div>
          </div>
          
          ${savedPrescription.complaints && savedPrescription.complaints.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold; margin-bottom: 10px;">COMPLAINTS</h3>
            ${savedPrescription.complaints.map((complaint: any) => `
              <div style="margin-bottom: 8px; padding: 8px; background-color: #f5f5f5; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;"><strong>${complaint.symptom}</strong> - ${complaint.severity}</p>
                ${complaint.duration ? `<p style="margin: 2px 0; font-size: 12px;">Duration: ${complaint.duration}</p>` : ''}
                ${complaint.description ? `<p style="margin: 2px 0; font-size: 12px;">${complaint.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${savedPrescription.details.diagnosis ? `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">DIAGNOSIS</h3>
            <p style="margin: 5px 0; font-size: 14px;">${savedPrescription.details.diagnosis}</p>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">MEDICATIONS</h3>
            ${savedPrescription.medications.map((medication: any, index: number) => `
              <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; font-weight: bold;">${index + 1}. ${medication.name}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Dosage:</strong> ${medication.dosage}</p>
                <p style="margin: 2px 0; font-size: 12px;"><strong>Quantity:</strong> ${medication.quantity}</p>
                ${medication.frequency ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Frequency:</strong> ${medication.frequency}</p>` : ''}
                ${medication.duration ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Duration:</strong> ${medication.duration}</p>` : ''}
                ${medication.instructions ? `<p style="margin: 2px 0; font-size: 12px;"><strong>Instructions:</strong> ${medication.instructions}</p>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${savedPrescription.details.notes ? `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">ADDITIONAL NOTES</h3>
            <p style="margin: 5px 0; font-size: 14px;">${savedPrescription.details.notes}</p>
          </div>
          ` : ''}
          
          ${savedPrescription.details.followUp ? `
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: bold;">FOLLOW-UP</h3>
            <p style="margin: 5px 0; font-size: 14px;">${savedPrescription.details.followUp}</p>
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
          <title>Prescription - ${savedPrescription.patient.name}</title>
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild": return "bg-green-100 text-green-800"
      case "moderate": return "bg-yellow-100 text-yellow-800"
      case "severe": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
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
                <h1 className="text-xl font-semibold text-gray-900">Create Prescription</h1>
                <p className="text-sm text-gray-500">New patient prescription form</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button onClick={savePrescription} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Prescription'}
              </Button>
              {savedPrescription && (
                <Button variant="outline" onClick={printPrescription}>
                  🖨️ Print
                </Button>
              )}
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
            <CardDescription>Enter patient details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor="patientGender">Gender</Label>
                <Select onValueChange={(value) => setPatientInfo({...patientInfo, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patientPhone">Phone</Label>
                <Input
                  id="patientPhone"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="patientAddress">Address</Label>
                <Input
                  id="patientAddress"
                  value={patientInfo.address}
                  onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
                  placeholder="Full address"
                />
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
                        placeholder="e.g., 3 days, 1 week"
                      />
                    </div>
                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <Select 
                        value={newComplaint.severity}
                        onValueChange={(value) => setNewComplaint({...newComplaint, severity: value})}
                      >
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
                <h4 className="font-medium mb-3">Recorded Complaints</h4>
                {complaints.length === 0 ? (
                  <p className="text-gray-500 text-sm">No complaints added yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium">{complaint.symptom}</h5>
                              <Badge className={getSeverityColor(complaint.severity)}>
                                {complaint.severity}
                              </Badge>
                            </div>
                            {complaint.duration && (
                              <p className="text-sm text-gray-600">Duration: {complaint.duration}</p>
                            )}
                            {complaint.description && (
                              <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComplaint(complaint.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
              <CardDescription>Prescribe medications and treatments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Medication Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Add Medication</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                      placeholder="e.g., Amoxicillin, Paracetamol"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="dosage">Dosage *</Label>
                      <Input
                        id="dosage"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        placeholder="e.g., 500mg, 1 tablet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newMedication.quantity}
                        onChange={(e) => setNewMedication({...newMedication, quantity: parseInt(e.target.value) || 1})}
                        placeholder="Quantity"
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
                        placeholder="e.g., 3 times daily"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                        placeholder="e.g., 7 days, 2 weeks"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                      placeholder="Special instructions or warnings"
                      rows={2}
                    />
                  </div>
                  <Button onClick={addMedication} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </div>

              {/* Medications List */}
              <div>
                <h4 className="font-medium mb-3">Prescribed Medications</h4>
                {medications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No medications added yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {medications.map((medication) => (
                      <div key={medication.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">{medication.name}</h5>
                            <p className="text-sm text-gray-600">
                              {medication.dosage} - {medication.quantity} units
                            </p>
                            {medication.frequency && (
                              <p className="text-sm text-gray-600">Frequency: {medication.frequency}</p>
                            )}
                            {medication.duration && (
                              <p className="text-sm text-gray-600">Duration: {medication.duration}</p>
                            )}
                            {medication.instructions && (
                              <p className="text-sm text-blue-600 mt-1">{medication.instructions}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(medication.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
            <CardTitle className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Diagnosis & Notes
            </CardTitle>
            <CardDescription>Medical diagnosis and additional notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={prescriptionDetails.diagnosis}
                onChange={(e) => setPrescriptionDetails({...prescriptionDetails, diagnosis: e.target.value})}
                placeholder="Enter diagnosis based on symptoms and examination"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={prescriptionDetails.notes}
                onChange={(e) => setPrescriptionDetails({...prescriptionDetails, notes: e.target.value})}
                placeholder="Any additional notes, warnings, or recommendations"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="followUp">Follow-up</Label>
              <Input
                id="followUp"
                value={prescriptionDetails.followUp}
                onChange={(e) => setPrescriptionDetails({...prescriptionDetails, followUp: e.target.value})}
                placeholder="e.g., Follow up after 1 week"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button onClick={savePrescription} disabled={isSaving} size="lg">
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Prescription'}
          </Button>
          {savedPrescription && (
            <Button variant="outline" onClick={printPrescription} size="lg">
              🖨️ Print Prescription
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
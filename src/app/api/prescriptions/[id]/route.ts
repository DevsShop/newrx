import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescription = await db.prescription.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        },
        items: {
          include: {
            medication: true
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error('Error fetching prescription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescription' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { details, medications } = body

    // Update prescription details
    const updatedPrescription = await db.prescription.update({
      where: { id: params.id },
      data: {
        diagnosis: details.diagnosis,
        notes: details.notes,
        status: details.status,
        updatedAt: new Date()
      }
    })

    // Handle medications - delete existing items and create new ones
    await db.prescriptionItem.deleteMany({
      where: { prescriptionId: params.id }
    })

    for (const medication of medications) {
      // Find or create medication
      let medicationRecord = await db.medication.findFirst({
        where: { name: medication.name }
      })

      if (!medicationRecord) {
        medicationRecord = await db.medication.create({
          data: {
            name: medication.name,
            dosageForm: 'Tablet', // Default, can be made configurable
            strength: medication.dosage,
            isActive: true
          }
        })
      }

      // Create prescription item
      await db.prescriptionItem.create({
        data: {
          prescriptionId: params.id,
          medicationId: medicationRecord.id,
          dosage: medication.dosage,
          frequency: medication.frequency,
          duration: medication.duration,
          instructions: medication.instructions,
          quantity: medication.quantity
        }
      })
    }

    // Fetch the updated prescription with all relations
    const finalPrescription = await db.prescription.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        },
        items: {
          include: {
            medication: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Prescription updated successfully',
      prescription: finalPrescription 
    })
  } catch (error) {
    console.error('Error updating prescription:', error)
    return NextResponse.json(
      { error: 'Failed to update prescription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete prescription items first
    await db.prescriptionItem.deleteMany({
      where: { prescriptionId: params.id }
    })

    // Delete prescription
    await db.prescription.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Prescription deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting prescription:', error)
    return NextResponse.json(
      { error: 'Failed to delete prescription' },
      { status: 500 }
    )
  }
}
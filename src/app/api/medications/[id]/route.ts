import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const medication = await db.medication.findUnique({
      where: { id },
      include: {
        prescriptionItems: {
          include: {
            prescription: {
              include: {
                patient: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                },
                doctor: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            prescription: {
              issuedAt: 'desc'
            }
          }
        }
      }
    })

    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    // Calculate usage statistics
    const totalPrescriptions = medication.prescriptionItems.length
    const activePrescriptions = medication.prescriptionItems.filter(
      item => item.prescription.status === 'ISSUED' || item.prescription.status === 'FILLED'
    ).length

    const usageByMonth = {}
    medication.prescriptionItems.forEach(item => {
      const month = new Date(item.prescription.issuedAt).toISOString().slice(0, 7)
      usageByMonth[month] = (usageByMonth[month] || 0) + 1
    })

    const transformedMedication = {
      ...medication,
      usageStats: {
        totalPrescriptions,
        activePrescriptions,
        usageByMonth,
        lastUsed: medication.prescriptionItems.length > 0 
          ? medication.prescriptionItems[0].prescription.issuedAt
          : null
      }
    }

    return NextResponse.json(transformedMedication)
  } catch (error) {
    console.error('Error fetching medication:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const medication = await db.medication.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        dosageForm: body.dosageForm,
        strength: body.strength,
        manufacturer: body.manufacturer,
        isActive: body.isActive
      }
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Error updating medication:', error)
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if medication is used in any prescriptions
    const prescriptionCount = await db.prescriptionItem.count({
      where: { medicationId: id }
    })

    if (prescriptionCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete medication',
          message: `This medication is used in ${prescriptionCount} prescription(s). Please deactivate it instead.`
        },
        { status: 400 }
      )
    }

    await db.medication.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Medication deleted successfully' })
  } catch (error) {
    console.error('Error deleting medication:', error)
    return NextResponse.json(
      { error: 'Failed to delete medication' },
      { status: 500 }
    )
  }
}
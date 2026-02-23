import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      patient,
      complaints,
      medications,
      details,
      doctorId = "default-doctor-id" // This would come from authentication
    } = body

    console.log('Received prescription data:', body)

    // Validate required fields
    if (!patient.name || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Patient name and at least one medication are required' },
        { status: 400 }
      )
    }

    // Create or find a default doctor first
    let doctorRecord = await db.doctor.findFirst({
      where: {
        licenseNumber: "DEFAULT-001"
      },
      include: {
        user: true
      }
    })

    if (!doctorRecord) {
      console.log('Creating new default doctor...')
      // Create a default user for doctor
      const doctorUser = await db.user.create({
        data: {
          name: "Dr. Default",
          email: "doctor.default@example.com",
          role: 'DOCTOR'
        }
      })

      console.log('Created doctor user:', doctorUser.id)

      // Create the doctor
      doctorRecord = await db.doctor.create({
        data: {
          userId: doctorUser.id,
          licenseNumber: "DEFAULT-001",
          specialization: "General Practice",
          experience: 10,
          phone: "555-0123"
        }
      })

      console.log('Created doctor record:', doctorRecord.id)
    } else {
      console.log('Found existing doctor:', doctorRecord.id, 'with user:', doctorRecord.userId)
    }

    // Verify doctor record is valid
    if (!doctorRecord.userId) {
      throw new Error('Doctor record has invalid user reference')
    }

    // Create or find patient
    let patientRecord = await db.patient.findFirst({
      where: {
        user: {
          name: patient.name
        }
      },
      include: {
        user: true
      }
    })

    if (!patientRecord) {
      console.log('Creating new patient...')
      // Create a user first
      const user = await db.user.create({
        data: {
          name: patient.name,
          email: `${patient.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          role: 'PATIENT'
        }
      })

      console.log('Created patient user:', user.id)

      // Then create the patient
      patientRecord = await db.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: patient.age ? new Date(new Date().getFullYear() - parseInt(patient.age), 0, 1) : null,
          phone: patient.phone || null,
          address: patient.address || null
        }
      })

      console.log('Created patient record:', patientRecord.id)
    } else {
      console.log('Found existing patient:', patientRecord.id, 'with user:', patientRecord.userId)
    }

    // Verify patient record is valid
    if (!patientRecord.userId) {
      throw new Error('Patient record has invalid user reference')
    }

    console.log('Creating prescription with doctorId:', doctorRecord.id, 'and patientId:', patientRecord.id)

    // Create prescription
    const prescription = await db.prescription.create({
      data: {
        patientId: patientRecord.id,
        doctorId: doctorRecord.id,
        status: 'DRAFT',
        diagnosis: details.diagnosis || null,
        notes: details.notes || null,
        issuedAt: new Date(),
        expiresAt: details.followUp ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // Default 7 days
      }
    })

    console.log('Created prescription:', prescription.id)

    // Create prescription items
    for (const medication of medications) {
      // Find or create medication
      let medicationRecord = await db.medication.findFirst({
        where: {
          name: medication.name
        }
      })

      if (!medicationRecord) {
        medicationRecord = await db.medication.create({
          data: {
            name: medication.name,
            dosageForm: medication.dosage.includes('tablet') ? 'Tablet' : 
                       medication.dosage.includes('capsule') ? 'Capsule' :
                       medication.dosage.includes('ml') ? 'Liquid' : 'Other',
            strength: medication.dosage,
            isActive: true
          }
        })
      }

      // Create prescription item
      await db.prescriptionItem.create({
        data: {
          prescriptionId: prescription.id,
          medicationId: medicationRecord.id,
          dosage: medication.dosage,
          frequency: medication.frequency || 'As needed',
          duration: medication.duration || 'As directed',
          instructions: medication.instructions || null,
          quantity: medication.quantity || 1
        }
      })
    }

    console.log('Prescription created successfully:', prescription.id)

    return NextResponse.json({
      message: 'Prescription created successfully',
      prescriptionId: prescription.id,
      patientId: patientRecord.id
    })

  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: `Failed to create prescription: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const whereClause: any = {}
    if (status && status !== 'all') {
      whereClause.status = status
    }

    const [prescriptions, total] = await Promise.all([
      db.prescription.findMany({
        where: whereClause,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.prescription.count({ where: whereClause })
    ])

    return NextResponse.json({
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}
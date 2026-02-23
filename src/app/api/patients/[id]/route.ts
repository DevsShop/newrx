import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get patient with detailed prescription history
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        prescriptions: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            items: {
              include: {
                medication: {
                  select: {
                    id: true,
                    name: true,
                    strength: true,
                    dosageForm: true
                  }
                }
              }
            }
          },
          orderBy: {
            issuedAt: 'desc'
          }
        },
        appointments: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        },
        medicalRecords: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            recordDate: 'desc'
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Calculate age from date of birth
    const age = patient.dateOfBirth 
      ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null

    // Transform the data
    const transformedPatient = {
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      dateOfBirth: patient.dateOfBirth,
      age,
      phone: patient.phone,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      createdAt: patient.createdAt,
      visitCount: patient.prescriptions.length,
      lastVisit: patient.prescriptions.length > 0 ? patient.prescriptions[0].issuedAt : null,
      prescriptions: patient.prescriptions,
      appointments: patient.appointments,
      medicalRecords: patient.medicalRecords
    }

    return NextResponse.json(transformedPatient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}
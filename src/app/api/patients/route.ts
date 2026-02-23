import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build the where clause for search
    const where = search
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive' as const
                }
              }
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive' as const
                }
              }
            },
            {
              phone: {
                contains: search,
                mode: 'insensitive' as const
              }
            }
          ]
        }
      : {}

    // Get patients with their prescription count
    const patients = await db.patient.findMany({
      where,
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
          select: {
            id: true,
            status: true,
            issuedAt: true,
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
            issuedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await db.patient.count({ where })

    // Transform the data to include visit count and other calculated fields
    const transformedPatients = patients.map(patient => ({
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      dateOfBirth: patient.dateOfBirth,
      phone: patient.phone,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      createdAt: patient.createdAt,
      visitCount: patient.prescriptions.length,
      lastVisit: patient.prescriptions.length > 0 ? patient.prescriptions[0].issuedAt : null,
      prescriptions: patient.prescriptions
    }))

    return NextResponse.json({
      patients: transformedPatients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}
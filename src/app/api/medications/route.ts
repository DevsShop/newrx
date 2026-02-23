import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          manufacturer: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive' as const
      }
    }

    if (activeOnly) {
      where.isActive = true
    }

    // Get medications with usage statistics
    const medications = await db.medication.findMany({
      where,
      include: {
        prescriptionItems: {
          select: {
            id: true,
            prescription: {
              select: {
                status: true,
                issuedAt: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await db.medication.count({ where })

    // Get unique categories for filtering
    const categories = await db.medication.findMany({
      where: {
        category: {
          not: null
        }
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    // Transform the data to include usage statistics
    const transformedMedications = medications.map(medication => {
      const totalPrescriptions = medication.prescriptionItems.length
      const activePrescriptions = medication.prescriptionItems.filter(
        item => item.prescription.status === 'ISSUED' || item.prescription.status === 'FILLED'
      ).length
      
      return {
        id: medication.id,
        name: medication.name,
        description: medication.description,
        category: medication.category,
        dosageForm: medication.dosageForm,
        strength: medication.strength,
        manufacturer: medication.manufacturer,
        isActive: medication.isActive,
        createdAt: medication.createdAt,
        updatedAt: medication.updatedAt,
        usageStats: {
          totalPrescriptions,
          activePrescriptions,
          lastUsed: medication.prescriptionItems.length > 0 
            ? medication.prescriptionItems.reduce((latest, item) => 
                item.prescription.issuedAt > latest ? item.prescription.issuedAt : latest, 
                medication.prescriptionItems[0].prescription.issuedAt
              )
            : null
        }
      }
    })

    return NextResponse.json({
      medications: transformedMedications,
      categories: categories.map(c => c.category).filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const medication = await db.medication.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        dosageForm: body.dosageForm,
        strength: body.strength,
        manufacturer: body.manufacturer,
        isActive: body.isActive ?? true
      }
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        {
          title: {
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
          patient: {
            user: {
              name: {
                contains: search,
                mode: 'insensitive' as const
              }
            }
          }
        },
        {
          doctor: {
            user: {
              name: {
                contains: search,
                mode: 'insensitive' as const
              }
            }
          }
        }
      ]
    }

    if (status) {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        where.date.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo)
      }
    }

    // Get appointments with patient and doctor information
    const appointments = await db.appointment.findMany({
      where,
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
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await db.appointment.count({ where })

    // Get today's appointments count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = await db.appointment.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get upcoming appointments count (next 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const upcomingAppointments = await db.appointment.count({
      where: {
        date: {
          gte: today,
          lte: nextWeek
        },
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({
      appointments,
      stats: {
        total,
        today: todayAppointments,
        upcoming: upcomingAppointments
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const appointment = await db.appointment.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        status: body.status || 'SCHEDULED'
      },
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
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
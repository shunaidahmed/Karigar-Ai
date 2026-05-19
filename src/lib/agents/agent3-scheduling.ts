export interface SchedulingResult {
  status: 'confirmed' | 'conflict' | 'cancelled'
  confirmedSlot: string
  conflictReason: string
  alternativeSlots: string[]
  waitlistAvailable: boolean
  waitlistPosition: number
  nextAvailableTime: string
}

export function agent3Scheduling(
  bookedSlots: string[],
  requestedFrom: string,
  requestedTo: string,
  travelBufferMinutes: number = 30
): SchedulingResult {
  const workingStart = 7 * 60 // 07:00 in minutes
  const workingEnd = 21 * 60 // 21:00 in minutes

  const requestedStart = parseTimeToMinutes(requestedFrom)
  const requestedEnd = parseTimeToMinutes(requestedTo)

  // Check working hours
  if (requestedStart < workingStart || requestedEnd > workingEnd) {
    return {
      status: 'conflict',
      confirmedSlot: '',
      conflictReason: 'Requested time is outside working hours (07:00-21:00)',
      alternativeSlots: generateAlternativeSlots(bookedSlots, travelBufferMinutes),
      waitlistAvailable: false,
      waitlistPosition: 0,
      nextAvailableTime: '',
    }
  }

  // Check for conflicts with existing bookings
  for (const slot of bookedSlots) {
    const slotStart = parseTimeToMinutes(slot)
    const slotEnd = slotStart + 60 // Assume 1 hour per job

    // Check overlap with travel buffer
    if (
      requestedStart < slotEnd + travelBufferMinutes &&
      requestedEnd + travelBufferMinutes > slotStart
    ) {
      return {
        status: 'conflict',
        confirmedSlot: '',
        conflictReason: `Conflict with existing booking at ${slot}`,
        alternativeSlots: generateAlternativeSlots(bookedSlots, travelBufferMinutes),
        waitlistAvailable: true,
        waitlistPosition: 1,
        nextAvailableTime: findNextAvailable(bookedSlots, travelBufferMinutes),
      }
    }
  }

  return {
    status: 'confirmed',
    confirmedSlot: `${requestedFrom} - ${requestedTo}`,
    conflictReason: '',
    alternativeSlots: [],
    waitlistAvailable: false,
    waitlistPosition: 0,
    nextAvailableTime: '',
  }
}

function parseTimeToMinutes(timeStr: string): number {
  // Handle ISO format or HH:MM format
  if (timeStr.includes('T')) {
    const date = new Date(timeStr)
    return date.getHours() * 60 + date.getMinutes()
  }
  const parts = timeStr.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1])
}

function generateAlternativeSlots(bookedSlots: string[], buffer: number): string[] {
  const alternatives: string[] = []
  const workingHours = [
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
  ]

  for (const slot of workingHours) {
    if (alternatives.length >= 3) break
    const [start] = slot.split('-')
    const isConflict = bookedSlots.some((bs) => {
      const bsStart = parseTimeToMinutes(bs)
      const slotStart = parseTimeToMinutes(start)
      return Math.abs(bsStart - slotStart) < 60 + buffer
    })
    if (!isConflict) {
      alternatives.push(slot)
    }
  }

  return alternatives
}

function findNextAvailable(bookedSlots: string[], buffer: number): string {
  const slots = generateAlternativeSlots(bookedSlots, buffer)
  return slots[0] || 'No slots available today'
}

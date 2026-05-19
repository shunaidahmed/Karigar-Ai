import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

type ProviderInsert = Database['public']['Tables']['providers']['Insert']

const cities = ['Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Multan']

const cityAreas: Record<string, string[]> = {
  Islamabad: ['G-13', 'G-11', 'G-10', 'G-9', 'G-8', 'G-7', 'G-6', 'F-10', 'F-11', 'F-8', 'F-7', 'F-6', 'I-8', 'I-10', 'Blue Area', 'E-11', 'H-8', 'H-9', 'H-10', 'H-11'],
  Karachi: ['Defence', 'Clifton', 'Gulshan', 'PECHS', 'FB Area', 'North Nazimabad', 'Gulistan-e-Jauhar', 'Korangi', 'Landhi', 'Saddar', 'Malir', 'Shah Faisal', 'Gulberg', 'Nazimabad', 'Bahadurabad'],
  Lahore: ['Gulberg', 'DHA', 'Model Town', 'Johar Town', 'Faisal Town', 'Township', 'Iqbal Town', 'Wapda Town', 'Green Town', 'Cantt', 'Liberty', 'Main Market', 'Garden Town', 'Walton', 'Allama Iqbal Town'],
  Peshawar: ['University Town', 'Hayatabad', 'Saddar', 'Kohati Bazar', 'Ring Road', 'Matni', 'Qissa Khwani', 'Andar Shehr', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Regi Model Town', 'Khyber Bazar'],
  Multan: ['Bosan Road', 'Shah Rukn-e-Alam', 'Cantt', 'Shah Shams', 'Gulgasht', 'People\'s Colony', 'Abdali Road', 'Dhok Bazar', 'Gulshan Colony', 'Hussain Agahi', 'Kotla Pathan', 'Mumtazabad', 'Shah Rukn-e-Alam', 'Wapda Colony', 'Gulshan-e-Ravi'],
}

const cityCoords: Record<string, { lat: number; lng: number }> = {
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Multan: { lat: 30.1575, lng: 71.5249 },
}

const firstNames = ['Ahmad', 'Ali', 'Usman', 'Bilal', 'Hamza', 'Tariq', 'Kashif', 'Saeed', 'Javed', 'Pervez', 'Zahid', 'Asad', 'Hassan', 'Sara', 'Fatima', 'Kamran', 'Raza', 'Faisal', 'Imran', 'Naveed', 'Shahid', 'Rashid', 'Waseed', 'Amir', 'Nasir', 'Farhan', 'Adeel', 'Sohail', 'Danish', 'Omar', 'Yasir', 'Junaid', 'Khalid', 'Majid', 'Rizwan', 'Salman', 'Tahir', 'Zafar', 'Babar', 'Haris', 'Irfan', 'Kamran', 'Mudassar', 'Nouman', 'Qasim', 'Saqib', 'Tayyab', 'Umar', 'Viqar', 'Zain']
const lastNames = ['Khan', 'Ahmed', 'Ali', 'Malik', 'Butt', 'Qureshi', 'Shah', 'Mirza', 'Chaudhry', 'Siddiqui', 'Raza', 'Hussain', 'Iqbal', 'Anwar', 'Bhatti', 'Gill', 'Javed', 'Khattak', 'Lodhi', 'Mughal', 'Niazi', 'Pasha', 'Rizvi', 'Sheikh', 'Tariq', 'Yousaf', 'Zaidi', 'Abbasi', 'Baloch', 'Dar', 'Farooq', 'Haider', 'Jamil', 'Khalil', 'Mehmood', 'Nasir', 'Qamar', 'Rafiq', 'Sarfraz', 'Taseer', 'Ullah', 'Waseem', 'Yousuf', 'Zahoor', 'Awan', 'Bashir', 'Chishti', 'Durrani', 'Ejaz', 'Faisal']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateProviders(): ProviderInsert[] {
  const providers: ProviderInsert[] = []
  let idCounter = 1

  const categories = [
    {
      skill: 'AC Repair',
      specializations: [
        ['Split AC', 'Window AC', 'Gas Refill', 'Installation'],
        ['Split AC', 'Central AC', 'Compressor'],
        ['Window AC', 'Gas Refill', 'Duct Cleaning'],
        ['Split AC', 'Ducted AC', 'Installation'],
        ['Split AC', 'Window AC', 'Maintenance'],
        ['Central AC', 'VRF Systems', 'Commercial'],
      ],
      jobComplexities: [['basic', 'intermediate', 'complex'], ['basic', 'intermediate', 'complex'], ['basic', 'intermediate'], ['basic', 'intermediate', 'complex'], ['basic', 'intermediate'], ['complex']],
      certifications: [['HVAC Certified', 'Samsung Authorized'], ['LG Authorized'], [], ['Daikin Certified'], [], ['Carrier Authorized', 'HVAC Certified']],
      hourlyRates: [1500, 1200, 1000, 1800, 900, 1400],
      visitFees: [500, 400, 350, 600, 300, 450],
      tiers: ['premium', 'standard', 'basic', 'premium', 'basic', 'premium'] as const,
    },
    {
      skill: 'Electrician',
      specializations: [
        ['Wiring', 'Lighting', 'Panel Board'],
        ['House Wiring', 'Fault Finding'],
        ['Industrial Wiring', 'Generator', 'UPS'],
        ['Lighting', 'Fan Repair'],
        ['Solar Installation', 'Inverter'],
        ['Wiring', 'Switch Board', 'MCB'],
      ],
      jobComplexities: [['basic', 'intermediate', 'complex'], ['basic', 'intermediate'], ['intermediate', 'complex'], ['basic'], ['intermediate', 'complex'], ['basic', 'intermediate']],
      certifications: [['Licensed Electrician'], [], ['Licensed Electrician', 'Safety Certified'], [], ['Solar Certified'], []],
      hourlyRates: [1000, 800, 1300, 600, 1100, 750],
      visitFees: [400, 350, 500, 250, 400, 300],
      tiers: ['standard', 'basic', 'premium', 'basic', 'standard', 'basic'] as const,
    },
    {
      skill: 'Plumber',
      specializations: [
        ['Pipe Repair', 'Water Tank', 'Bathroom Fitting'],
        ['Leak Detection', 'Sewer Line'],
        ['Bathroom Renovation', 'Water Heater'],
        ['Pipe Fitting', 'Tap Repair'],
        ['Water Pump', 'Overhead Tank'],
        ['Drain Cleaning', 'Water Filter'],
      ],
      jobComplexities: [['basic', 'intermediate', 'complex'], ['intermediate', 'complex'], ['basic', 'intermediate', 'complex'], ['basic'], ['intermediate'], ['basic', 'intermediate']],
      certifications: [['Licensed Plumber'], [], ['Licensed Plumber'], [], [], []],
      hourlyRates: [1000, 900, 1400, 700, 950, 800],
      visitFees: [400, 350, 500, 250, 350, 300],
      tiers: ['standard', 'basic', 'premium', 'basic', 'standard', 'basic'] as const,
    },
    {
      skill: 'Home Tutor',
      specializations: [
        ['Mathematics', 'Physics', 'Chemistry'],
        ['English', 'Urdu', 'Islamiat'],
        ['Biology', 'Chemistry', 'O/A Levels'],
        ['Mathematics', 'Statistics'],
        ['Quran', 'Islamiat', 'Arabic'],
        ['Computer Science', 'Programming'],
      ],
      jobComplexities: [['basic', 'intermediate', 'complex'], ['basic', 'intermediate'], ['intermediate', 'complex'], ['basic', 'intermediate'], ['basic', 'intermediate'], ['basic', 'intermediate', 'complex']],
      certifications: [['PhD Physics', 'Teaching Certified'], ['MA English'], ['MBBS', 'Teaching Certified'], ['MSc Math'], ['Hafiz-e-Quran', 'Maulvi'], ['BS CS', 'Teaching Certified']],
      hourlyRates: [2000, 1200, 1500, 800, 1000, 1300],
      visitFees: [800, 500, 600, 350, 400, 550],
      tiers: ['premium', 'standard', 'premium', 'basic', 'premium', 'standard'] as const,
    },
    {
      skill: 'Mechanic',
      specializations: [
        ['Engine Repair', 'Oil Change', 'Brake Service'],
        ['Battery Jump', 'Tire Change', 'Minor Repairs'],
        ['AC Repair', 'Engine Tuning', 'Diagnostics'],
        ['Bike Repair', 'Car Service'],
        ['Transmission', 'Suspension'],
        ['Denting', 'Painting', 'Detailing'],
      ],
      jobComplexities: [['basic', 'intermediate', 'complex'], ['basic', 'intermediate'], ['intermediate', 'complex'], ['basic', 'intermediate'], ['intermediate', 'complex'], ['basic', 'intermediate']],
      certifications: [['Toyota Certified'], [], ['Honda Certified', 'Diagnostic Specialist'], [], ['Suzuki Certified'], []],
      hourlyRates: [1200, 900, 1500, 700, 1300, 850],
      visitFees: [500, 400, 600, 300, 550, 350],
      tiers: ['standard', 'basic', 'premium', 'basic', 'standard', 'basic'] as const,
    },
  ]

  const languages = [['Urdu', 'Punjabi'], ['Urdu'], ['Urdu', 'Sindhi'], ['Urdu', 'Pashto'], ['Urdu', 'English'], ['Urdu', 'Saraiki'], ['Urdu', 'Punjabi', 'English']]

  for (const category of categories) {
    for (let i = 0; i < 50; i++) {
      const city = cities[i % 5]
      const areas = cityAreas[city]
      const coords = cityCoords[city]
      const rng = seededRandom(idCounter * 1000 + i)

      const specIndex = i % category.specializations.length
      const firstName = firstNames[Math.floor(rng() * firstNames.length)]
      const lastName = lastNames[Math.floor(rng() * lastNames.length)]
      const areaCount = 2 + Math.floor(rng() * 4)
      const shuffledAreas = [...areas].sort(() => rng() - 0.5).slice(0, areaCount)

      const ratingBase = 3.5 + rng() * 1.5
      const rating = Math.round(ratingBase * 10) / 10
      const totalReviews = Math.floor(30 + rng() * 500)
      const onTimeScore = Math.floor(60 + rng() * 40)
      const cancellationRate = Math.floor(rng() * 15)
      const disputeCount = Math.floor(rng() * 6)
      const yearsExperience = Math.floor(1 + rng() * 20)
      const maxDailyCapacity = 3 + Math.floor(rng() * 4)
      const currentDayBookings = Math.floor(rng() * maxDailyCapacity)

      const sentimentOptions = ['positive', 'neutral', 'negative'] as const
      const sentiment = rating >= 4.5 ? 'positive' : rating >= 3.5 ? 'neutral' : 'negative'

      const riskScore: 'low' | 'medium' | 'high' = disputeCount >= 4 ? 'high' : disputeCount >= 2 ? 'medium' : 'low'

      const tier = category.tiers[specIndex]
      const visitFee = Math.round(category.visitFees[specIndex] * (0.8 + rng() * 0.4))
      const hourlyRate = Math.round(category.hourlyRates[specIndex] * (0.8 + rng() * 0.4))

      const langSet = languages[Math.floor(rng() * languages.length)]

      providers.push({
        id: `P${String(idCounter).padStart(3, '0')}`,
        name: `${firstName} ${lastName} ${category.skill}${i % 3 === 0 ? ' Services' : i % 3 === 1 ? ' Pro' : ''}`,
        phone: `03${Math.floor(10 + rng() * 90)}-${Math.floor(100 + rng() * 900)}${Math.floor(1000 + rng() * 9000)}`,
        skill: category.skill,
        specializations: category.specializations[specIndex],
        job_complexity_handled: category.jobComplexities[specIndex],
        certifications: category.certifications[specIndex],
        city,
        areas: shuffledAreas,
        lat: coords.lat + (rng() - 0.5) * 0.1,
        lng: coords.lng + (rng() - 0.5) * 0.1,
        rating: Math.min(5, rating),
        total_reviews: totalReviews,
        recent_review_date: new Date(Date.now() - Math.floor(rng() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        recent_review_sentiment: sentiment,
        on_time_score: onTimeScore,
        cancellation_rate: cancellationRate,
        reliability_score: Math.floor((onTimeScore + (100 - cancellationRate) + (100 - disputeCount * 10)) / 3),
        risk_score: riskScore,
        dispute_count: disputeCount,
        visit_fee: visitFee,
        hourly_rate_pkr: hourlyRate,
        rate_per_km: 15 + Math.floor(rng() * 15),
        loyalty_discount: tier === 'premium' ? 10 : tier === 'standard' ? 5 : 0,
        available: rng() > 0.1,
        booked_slots: [],
        max_daily_capacity: maxDailyCapacity,
        current_day_bookings: currentDayBookings,
        years_experience: yearsExperience,
        languages_spoken: langSet,
        tier,
      })

      idCounter++
    }
  }

  return providers
}

export async function GET() {
  const supabase = createAdminClient()

  const { count } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    return NextResponse.json({ message: 'Providers already seeded', count })
  }

  const providers = generateProviders()
  const { error } = await supabase.from('providers').insert(providers as any)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Providers seeded successfully', count: providers.length })
}
